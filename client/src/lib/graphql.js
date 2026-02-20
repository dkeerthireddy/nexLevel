import { gql } from '@apollo/client';

// ============================================================
// AUTHENTICATION
// ============================================================

export const SIGNUP = gql`
  mutation Signup($email: String!, $password: String!, $displayName: String!) {
    signup(email: $email, password: $password, displayName: $displayName) {
      token
      user {
        id
        email
        displayName
        profilePhoto
        emailVerified
        stats {
          totalChallenges
          activeChallenges
          completedChallenges
          totalCheckIns
          longestStreak
        }
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        displayName
        profilePhoto
        emailVerified
        stats {
          totalChallenges
          activeChallenges
          completedChallenges
          totalCheckIns
          longestStreak
        }
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      displayName
      profilePhoto
      emailVerified
      role
      settings {
        notifications {
          enabled
          quietHours {
            start
            end
          }
          types {
            partnerComplete
            dailyReminder
            streakMilestone
          }
        }
        ai {
          coachEnabled
          photoVerification
          recommendations
          weeklyReports
        }
        theme
      }
      stats {
        totalChallenges
        activeChallenges
        completedChallenges
        totalCheckIns
        longestStreak
      }
      createdAt
    }
  }
`;

export const UPDATE_SETTINGS = gql`
  mutation UpdateSettings($settings: UserSettingsInput!) {
    updateSettings(settings: $settings) {
      id
      settings {
        notifications {
          enabled
          quietHours {
            start
            end
          }
          types {
            partnerComplete
            dailyReminder
            streakMilestone
          }
        }
        ai {
          coachEnabled
          photoVerification
          recommendations
          weeklyReports
        }
        theme
      }
    }
  }
`;

// ============================================================
// CHALLENGES
// ============================================================

export const GET_POPULAR_CHALLENGES = gql`
  query GetPopularChallenges($limit: Int) {
    popularChallenges(limit: $limit) {
      id
      name
      description
      category
      frequency
      duration
      requirePhotoProof
      tasks {
        id
        title
        description
        order
      }
      stats {
        totalUsers
        activeUsers
        completionRate
      }
      createdAt
    }
  }
`;

export const GET_MY_ACTIVE_CHALLENGES = gql`
  query GetMyActiveChallenges {
    myActiveChallenges {
      id
      challenge {
        id
        name
        description
        category
        frequency
        duration
        requirePhotoProof
        challengeType
        tasks {
          id
          title
          description
          order
        }
        stats {
          totalUsers
          activeUsers
        }
      }
      currentStreak
      longestStreak
      totalCheckIns
      missedDays
      completionRate
      status
      startDate
      endDate
      partners {
        id
        displayName
        profilePhoto
      }
      taskProgress {
        taskId
        task {
          id
          title
          description
          order
        }
        completed
        completedAt
        completedCount
      }
      allParticipants {
        user {
          id
          displayName
          profilePhoto
        }
        currentStreak
        totalCheckIns
        completionRate
        lastCheckInAt
        isYou
      }
      lastCheckIn {
        id
        date
        timestamp
        note
        taskId
        task {
          id
          title
        }
      }
    }
  }
`;

export const CREATE_CHALLENGE = gql`
  mutation CreateChallenge($input: CreateChallengeInput!) {
    createChallenge(input: $input) {
      id
      name
      description
      category
      frequency
      duration
    }
  }
`;

export const JOIN_CHALLENGE = gql`
  mutation JoinChallenge($challengeId: ID!, $partnerIds: [ID!]) {
    joinChallenge(challengeId: $challengeId, partnerIds: $partnerIds) {
      id
      challenge {
        id
        name
      }
      currentStreak
      status
    }
  }
`;

// ============================================================
// CHECK-INS
// ============================================================

export const CHECK_IN = gql`
  mutation CheckIn($userChallengeId: ID!, $taskId: ID!, $note: String, $photoBase64: String) {
    checkIn(userChallengeId: $userChallengeId, taskId: $taskId, note: $note, photoBase64: $photoBase64) {
      id
      date
      timestamp
      note
      photoUrl
      taskId
      task {
        id
        title
      }
      aiVerification {
        verified
        confidence
        detectedActivity
      }
    }
  }
`;

export const GET_CHECK_INS_FOR_CHALLENGE = gql`
  query GetCheckInsForChallenge($userChallengeId: ID!, $startDate: String, $endDate: String) {
    checkInsForChallenge(userChallengeId: $userChallengeId, startDate: $startDate, endDate: $endDate) {
      id
      date
      timestamp
      note
      photoUrl
      taskId
      task {
        id
        title
        description
      }
      aiVerification {
        verified
        confidence
        detectedActivity
        detectedObjects
      }
    }
  }
`;

// ============================================================
// AI FEATURES
// ============================================================

export const GENERATE_AI_COACH_MESSAGE = gql`
  mutation GenerateAICoachMessage($challengeId: ID) {
    generateAICoachMessage(challengeId: $challengeId) {
      id
      type
      content
      createdAt
    }
  }
`;

export const GENERATE_WEEKLY_REPORT = gql`
  mutation GenerateWeeklyReport {
    generateWeeklyReport {
      id
      type
      content
      createdAt
    }
  }
`;

export const GET_AI_MESSAGES = gql`
  query GetAIMessages($unreadOnly: Boolean, $limit: Int) {
    aiMessages(unreadOnly: $unreadOnly, limit: $limit) {
      id
      type
      content
      challengeId
      read
      liked
      createdAt
    }
  }
`;

export const MARK_MESSAGE_READ = gql`
  mutation MarkMessageRead($id: ID!) {
    markMessageRead(id: $id) {
      id
      read
    }
  }
`;

// ============================================================
// SOCIAL
// ============================================================

export const GET_FRIENDS = gql`
  query GetFriends {
    friends {
      id
      displayName
      profilePhoto
      stats {
        activeChallenges
        longestStreak
      }
    }
  }
`;

export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      displayName
      email
      profilePhoto
      stats {
        activeChallenges
        longestStreak
      }
    }
  }
`;

export const SEND_FRIEND_REQUEST = gql`
  mutation SendFriendRequest($userId: ID!) {
    sendFriendRequest(userId: $userId)
  }
`;

export const ACCEPT_FRIEND_REQUEST = gql`
  mutation AcceptFriendRequest($userId: ID!) {
    acceptFriendRequest(userId: $userId)
  }
`;

// ============================================================
// NOTIFICATIONS
// ============================================================

export const GET_NOTIFICATIONS = gql`
  query GetNotifications($unreadOnly: Boolean, $limit: Int) {
    notifications(unreadOnly: $unreadOnly, limit: $limit) {
      id
      type
      title
      message
      challengeId
      read
      createdAt
    }
  }
`;

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      read
    }
  }
`;

export const RENAME_CHALLENGE = gql`
  mutation RenameChallenge($challengeId: ID!, $newName: String!) {
    renameChallenge(challengeId: $challengeId, newName: $newName) {
      id
      name
      updatedAt
    }
  }
`;

export const EXIT_CHALLENGE = gql`
  mutation ExitChallenge($userChallengeId: ID!, $reason: String) {
    exitChallenge(userChallengeId: $userChallengeId, reason: $reason)
  }
`;

export const INVITE_EMAIL_TO_CHALLENGE = gql`
  mutation InviteEmailToChallenge($email: String!, $challengeId: ID!, $message: String) {
    inviteEmailToChallenge(email: $email, challengeId: $challengeId, message: $message)
  }
`;

export const INVITE_EMAIL_TO_USER_CHALLENGE = gql`
  mutation InviteEmailToUserChallenge($email: String!, $userChallengeId: ID!, $message: String) {
    inviteEmailToUserChallenge(email: $email, userChallengeId: $userChallengeId, message: $message)
  }
`;

export const UPDATE_EMAIL_CONFIG = gql`
  mutation UpdateEmailConfig($gmailUser: String, $gmailAppPassword: String, $enabled: Boolean) {
    updateEmailConfig(gmailUser: $gmailUser, gmailAppPassword: $gmailAppPassword, enabled: $enabled) {
      id
      email
      emailConfig {
        gmailUser
        enabled
      }
    }
  }
`;

export const REQUEST_PASSWORD_RESET = gql`
  mutation RequestPasswordReset($email: String!) {
    requestPasswordReset(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const VERIFY_EMAIL = gql`
  mutation VerifyEmail($code: String!) {
    verifyEmail(code: $code)
  }
`;

export const RESEND_VERIFICATION_EMAIL = gql`
  mutation ResendVerificationEmail {
    resendVerificationEmail
  }
`;

export const REQUEST_PASSWORD_CHANGE = gql`
  mutation RequestPasswordChange($currentPassword: String!) {
    requestPasswordChange(currentPassword: $currentPassword)
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($code: String!, $newPassword: String!) {
    changePassword(code: $code, newPassword: $newPassword)
  }
`;

export const ENABLE_TWO_FACTOR = gql`
  mutation EnableTwoFactor {
    enableTwoFactor {
      secret
      qrCode
      backupCodes
    }
  }
`;

export const VERIFY_TWO_FACTOR = gql`
  mutation VerifyTwoFactor($code: String!) {
    verifyTwoFactor(code: $code)
  }
`;

export const DISABLE_TWO_FACTOR = gql`
  mutation DisableTwoFactor($code: String!) {
    disableTwoFactor(code: $code)
  }
`;

// ============================================================
// POLLING / REALTIME
// ============================================================

export const GET_UPDATES = gql`
  query GetUpdates($since: String!) {
    updates(since: $since) {
      newCheckIns {
        id
        timestamp
      }
      newMessages {
        id
        content
        createdAt
      }
      friendActivity {
        user {
          id
          displayName
        }
        action
        challenge {
          id
          name
        }
        timestamp
      }
      timestamp
    }
  }
`;

// ============================================================
// FEEDBACK
// ============================================================

export const SEND_FEEDBACK = gql`
  mutation SendFeedback($name: String!, $email: String!, $subject: String!, $message: String!) {
    sendFeedback(name: $name, email: $email, subject: $subject, message: $message) {
      success
      message
    }
  }
`;

export const GET_ALL_FEEDBACK = gql`
  query GetAllFeedback($status: String, $limit: Int, $offset: Int) {
    allFeedback(status: $status, limit: $limit, offset: $offset) {
      id
      name
      email
      subject
      message
      status
      adminNotes
      createdAt
      updatedAt
    }
  }
`;

export const UPDATE_FEEDBACK_STATUS = gql`
  mutation UpdateFeedbackStatus($feedbackId: ID!, $status: String!) {
    updateFeedbackStatus(feedbackId: $feedbackId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

export const ADD_FEEDBACK_NOTE = gql`
  mutation AddFeedbackNote($feedbackId: ID!, $note: String!) {
    addFeedbackNote(feedbackId: $feedbackId, note: $note) {
      id
      adminNotes
      updatedAt
    }
  }
`;

export const GET_SYSTEM_STATS = gql`
  query GetSystemStats {
    systemStats {
      totalUsers
      totalChallenges
      totalCheckIns
      activeUsers
      activeChallenges
    }
  }
`;

export const GET_SYSTEM_SETTINGS = gql`
  query GetSystemSettings {
    systemSettings {
      aiCoachEnabled
      updatedAt
      updatedBy
    }
  }
`;

export const UPDATE_SYSTEM_SETTINGS = gql`
  mutation UpdateSystemSettings($aiCoachEnabled: Boolean!) {
    updateSystemSettings(aiCoachEnabled: $aiCoachEnabled) {
      aiCoachEnabled
      updatedAt
      updatedBy
    }
  }
`;
