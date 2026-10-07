import datetime
from random import randint


def generate_matric_number():
    year = datetime.datetime.now().year
    random_digits = randint(1000, 9999)

    return f"STU{year}{random_digits}"