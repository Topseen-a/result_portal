import datetime
from random import random


def generate_matric_number():
    year = datetime.now().year
    random_digits = random.randint(1000, 9999)

    return f"STU{year}{random_digits}"