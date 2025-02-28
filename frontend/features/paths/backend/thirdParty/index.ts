export const thirdPartyPath = {
    azure: {
        speech_services: {
            get_or_refresh: '/backendapi/third_party/azure/speech_services/get_or_refresh/',
        },
    },
    gcloud: {
        ws_stt_tts: 'ws/third_party/gcloud/stt_tts',
    },
} as const;

// prettier-ignore
export type thirdPartyPath = typeof thirdPartyPath;