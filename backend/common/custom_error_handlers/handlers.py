from django.http import JsonResponse
from rest_framework import status


def custom_bad_request(request, exception=None):
    """カスタム 400 Bad Request"""
    return JsonResponse(
        {
            'errors': [{
                'status': str(status.HTTP_400_BAD_REQUEST),
                'title':  'Bad Request',
                'detail': 'The request could not be understood by the server.',
            }]
        },
        status=status.HTTP_400_BAD_REQUEST,)

def custom_permission_denied(request, exception=None):
    """カスタム 403 Forbidden"""
    return JsonResponse(
        {
            'errors': [{
                'status': str(status.HTTP_403_FORBIDDEN),
                'title':  'Permission Denied',
                'detail': 'You do not have permission to access this resource.',
            }]
        },
        status=status.HTTP_403_FORBIDDEN,
    )

def custom_page_not_found(request, exception=None):
    """カスタム 404 Not Found"""
    return JsonResponse(
        {
            'errors': [{
                'status': str(status.HTTP_404_NOT_FOUND),
                'title':  'Not Found',
                'detail': 'The requested resource was not found.',
            }]
        },
        status=status.HTTP_404_NOT_FOUND,
    )

def custom_server_error(request):
    """カスタム 500 Internal Server Error"""
    return JsonResponse(
        {
            'errors': [{
                'status': str(status.HTTP_500_INTERNAL_SERVER_ERROR),
                'title':  'Internal Server Error',
                'detail': 'An unexpected error occurred on the server.',
            }]
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )