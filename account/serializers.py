from rest_framework import serializers


class StudentEnrollmentSerializer(serializers.Serializer):
    department = serializers.CharField(max_length=10, required=True)
    entry_year = serializers.IntegerField()
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)


class StaffEnrollmentSerializer(serializers.Serializer):
    department = serializers.CharField(max_length=10, required=True)
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)


# {
#         "department": "MBBS",
#         "entry_year": 2025,
#         "email": "dayo@gmail.com",
#          "username": "dayo",
#          "password": "dayo123",
#          "first_name": "adedayo",
#          "last_name": "ajewole"
# }

# {
#     "department": "MBBS",
#     "designation": "professor",
#     "email": "fola@gmail.com",
#     "username": "fola",
#     "first_name": "folajimi",
#     "last_name": "lawal"
# }