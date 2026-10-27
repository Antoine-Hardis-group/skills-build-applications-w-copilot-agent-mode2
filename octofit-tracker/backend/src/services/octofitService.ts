import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Activity payload must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (
    typeof userId !== 'string' ||
    !mongoose.isObjectIdOrHexString(userId) ||
    typeof teamId !== 'string' ||
    !mongoose.isObjectIdOrHexString(teamId) ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw Object.assign(new Error('Activity payload is invalid'), { status: 400 });
  }

  const [userExists, teamExists] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!userExists || !teamExists) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Team payload must be an object'), { status: 400 });
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim() || typeof mascot !== 'string' || !mascot.trim()) {
    throw Object.assign(new Error('Team name and mascot are required'), { status: 400 });
  }

  const memberIds = members ?? [];
  if (
    !Array.isArray(memberIds) ||
    !memberIds.every((memberId): memberId is string =>
      typeof memberId === 'string' && mongoose.isObjectIdOrHexString(memberId),
    )
  ) {
    throw Object.assign(new Error('Team members must be valid user IDs'), { status: 400 });
  }

  const uniqueMemberIds = [...new Set(memberIds)];
  const existingMemberCount = await User.countDocuments({ _id: { $in: uniqueMemberIds } });
  if (existingMemberCount !== uniqueMemberIds.length) {
    throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
  }

  return Team.create({ name: name.trim(), mascot: mascot.trim(), members: uniqueMemberIds });
}

export async function getLeaderboard() {
  const [teams, activityTotals] = await Promise.all([
    Team.find().select('name').lean(),
    Activity.aggregate<{ _id: mongoose.Types.ObjectId; totalPoints: number }>([
      { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    ]),
  ]);

  const totalsByTeam = new Map(activityTotals.map(({ _id, totalPoints }) => [String(_id), totalPoints]));
  return teams
    .map((team) => ({
      teamName: team.name,
      totalPoints: totalsByTeam.get(String(team._id)) ?? 0,
    }))
    .sort((left, right) => right.totalPoints - left.totalPoints || left.teamName.localeCompare(right.teamName))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail.trim().toLowerCase() }).lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);

  const activityType = recentActivity?.type.trim().toLowerCase();
  const activityFocus = activityType
    ? ['run', 'walk', 'cycle'].includes(activityType) ? 'endurance' : activityType
    : undefined;
  const fitnessGoal = typeof user.fitnessGoal === 'string' ? user.fitnessGoal.trim() : '';
  const preferences = [
    fitnessGoal
      ? { focus: fitnessGoal.toLowerCase(), reason: `Recommended to support your ${fitnessGoal} fitness goal.` }
      : undefined,
    activityFocus
      ? { focus: activityFocus, reason: `Recommended based on your recent ${activityType} activity.` }
      : undefined,
  ].filter((preference): preference is { focus: string; reason: string } => Boolean(preference));

  const matchedPreference = preferences.find((preference) =>
    workouts.some((workout) => workout.focus.trim().toLowerCase() === preference.focus),
  );
  if (!matchedPreference) return [];

  return workouts
    .filter((workout) => workout.focus.trim().toLowerCase() === matchedPreference.focus)
    .map((workout) => ({ ...workout, reason: matchedPreference.reason }));
}

export { User };
