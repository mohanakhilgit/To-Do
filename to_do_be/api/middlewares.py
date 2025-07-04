import re
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin


class APIErrorMiddleware(MiddlewareMixin):
    """
    Middleware to ensure API errors return JSON responses
    """
    def process_response(self, request, response):
        # Only process error responses (4xx, 5xx)
        if not (400 <= response.status_code < 600):
            return response
            
        # Only handle API requests
        if not self._is_api_request(request):
            return response
            
        # If already a JSON response, leave it alone
        if self._is_json_response(response):
            return response
            
        # Convert HTML error response to JSON
        error_message = self._get_error_message(response)
        
        json_response = JsonResponse({
            'error': self._get_error_title(response.status_code),
            'detail': error_message,
            'status_code': response.status_code
        }, status=response.status_code)
        
        return json_response
        
    def _is_api_request(self, request):
        """Check if the request is to the API"""
        # API path pattern
        if re.match(r'^/api/', request.path):
            return True
            
        # Check Accept header
        accept = request.META.get('HTTP_ACCEPT', '')
        if 'application/json' in accept and 'text/html' not in accept:
            return True
            
        # AJAX request
        if request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest':
            return True
            
        return False
        
    def _is_json_response(self, response):
        content_type = response.get('Content-Type', '')
        return 'application/json' in content_type
        
    def _get_error_message(self, response):
        if hasattr(response, 'data') and isinstance(response.data, dict):
            if 'detail' in response.data:
                return response.data['detail']
            if 'error' in response.data:
                return response.data['error']
        
        # Default messages based on status code
        status_messages = {
            404: 'The requested resource was not found',
            403: 'You do not have permission to perform this action',
            401: 'Authentication is required',
            400: 'Bad request',
            500: 'Server error'
        }
        return status_messages.get(response.status_code, 'An error occurred')
        
    def _get_error_title(self, status_code):
        """Get a title for the error based on status code"""
        titles = {
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            405: 'Method Not Allowed',
            500: 'Server Error'
        }
        return titles.get(status_code, 'Error')
