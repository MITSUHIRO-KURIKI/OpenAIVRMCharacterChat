export const vrmChatPath: Record<string, string> = {
  // WebSocket
  ws_room: 'ws/vrmchat/room/',
  // Room model
  room: '/backendapi/vrmchat/room/',
  // RoomSettings model
  room_settings:                '/backendapi/vrmchat/room_settings/',
  room_settings_room_name_list: '/backendapi/vrmchat/room_settings/list/room_name',
} as const;

// prettier-ignore
export type vrmChatPath = typeof vrmChatPath;