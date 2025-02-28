export const userPropertiesPath: Record<string, string> = {
  // UserProfile model
  user_profile: '/backendapi/user_properties/user_profile/',
  // UserReceptionSetting model
  reception_setting: '/backendapi/user_properties/reception_setting/'
} as const;

// prettier-ignore
export type userPropertiesPath = typeof userPropertiesPath;