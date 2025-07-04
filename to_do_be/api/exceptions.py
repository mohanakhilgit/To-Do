from rest_framework.views import exception_handler
from rest_framework import status
import logging

from .response import GlobalApiResponse


logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    error_message = "An unexpected error occurred."
    data = {}
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR # Default to 500
    logger.exception(f"Error: {repr(exc)}")

    if response is not None:
        status_code = response.status_code # Get status_code from DRF's response
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                # Use 400 for "Object not found" type errors as requested
                if response.status_code == status.HTTP_404_NOT_FOUND:
                    status_code = status.HTTP_400_BAD_REQUEST
                    error_message = str(response.data['detail']) + " (Resource not found)"
                else:
                    error_message = str(response.data['detail'])
            else: # Handle validation errors from serializers
                error_message = "Validation failed."
                data = {'errors': response.data}
        elif isinstance(response.data, list):
            error_message = "Multiple errors occurred."
            data = {'errors': response.data}
        else:
            error_message = str(response.data)

    return GlobalApiResponse(
        data=data,
        message=error_message,
        status_code=status_code,
        success=False
    )
