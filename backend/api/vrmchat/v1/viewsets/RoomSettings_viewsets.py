# https://www.django-rest-framework.org/api-guide/status-codes/
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from api.utils import StandardThrottle
from apps.vrmchat.models import RoomSettings
from apps.vrmchat.models import MODEL_NAME_CHOICES
from ..serializers import RoomSettingsSerializer

MODEL_NAME_CHOICES_TUPLE = MODEL_NAME_CHOICES()

class RoomSettingsViewSet(APIView):

    permission_classes = [IsAuthenticated]
    throttle_classes   = [StandardThrottle]

    def get(self, request, room_id, *args, **kwargs):
        try:
            room_settings_obj = get_object_or_404(RoomSettings,
                                                  room_id__create_user = request.user,
                                                  room_id__room_id     = room_id,
                                                  room_id__is_active   = True,)
            serializer = RoomSettingsSerializer(instance=room_settings_obj)
            data       = serializer.data
            
            # model_name_choices を JSON 用に整形
            model_name_choices = []
            for value, label in MODEL_NAME_CHOICES_TUPLE:
                model_name_choices.append({'value': value, 'label': label})
            data['model_name_choices'] = model_name_choices

            response = Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            response = Response({
                'message': 'failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response

    def patch(self, request, room_id, *args, **kwargs):
        try:
            room_settings_obj = RoomSettings.objects.filter(
                                                room_id__create_user = request.user,
                                                room_id__room_id     = room_id,
                                                room_id__is_active   = True,
                                            ).first()
            if room_settings_obj:
                serializer = RoomSettingsSerializer(instance=room_settings_obj, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                response = Response(serializer.data, status=status.HTTP_200_OK)
            else:
                response = Response({}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(e)
            response = Response({
                'message': 'failed',
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return response