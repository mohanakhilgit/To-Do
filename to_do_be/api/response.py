from rest_framework.response import Response


# GlobalApiResponse class for consistent API responses across the application
class GlobalApiResponse(Response):
    def __init__(self, data=None, message="", status_code=200, success=True, **kwargs):
        response_data = {
            "success": success,
            "status_code": status_code,
            "message": message,
            "data": data if data is not None else {}
        }
        super().__init__(data=response_data, status=status_code, **kwargs)
