from decimal import Decimal
from results.models import Result


def calculate_grade(score):
    if score >= 70:
        return 'A', Decimal("5.0")
    elif score >= 60:
        return 'B', Decimal("4.0")
    elif score >= 50:
        return 'C', Decimal("3.0")
    elif score >= 45:
        return 'D', Decimal("2.0")
    elif score >= 40:
        return 'E', Decimal("1.0")

    return 'F', Decimal("0.0")


def calculate_gpa(student, session):
    results = Result.objects.filter(
        registration__student=student,
        registration__session=session,
        is_published=True
    ).select_related("registration__course")

    total_units = 0
    total_points = Decimal("0.0")

    for result in results:
        units = (
            result.registration
            .course
            .credit_units
        )

        total_units += units
        total_points += (units * result.grade_point)

    if total_points == 0:
        return Decimal("0.00")

    return round(total_points / total_units, 2)


def calculate_cgpa(student):
    results = Result.objects.filter(
        registration__student=student,
        is_published=True
    ).select_related("registration__course")

    total_units = 0
    total_points = Decimal("0.0")

    for result in results:
        units = (
            result.registration
            .course
            .credit_units
        )

        total_units += units
        total_points += (units * result.grade_point)

    if total_units == 0:
        return Decimal("0.00")

    return round(total_points / total_units,2)


def session_breakdown(student):
    """GPA, credit units and course count for each session with published results, oldest first."""
    results = Result.objects.filter(
        registration__student=student,
        is_published=True,
    ).select_related("registration__course", "registration__session")

    sessions = {}
    for result in results:
        session = result.registration.session
        units = result.registration.course.credit_units
        entry = sessions.setdefault(session.id, {
            "id": session.id,
            "name": session.name,
            "semester": session.get_semester_display(),
            "year": session.year,
            "semester_key": session.semester,
            "units": 0,
            "points": Decimal("0.0"),
            "courses": 0,
        })
        entry["units"] += units
        entry["points"] += units * result.grade_point
        entry["courses"] += 1

    breakdown = []
    for entry in sorted(sessions.values(), key=lambda e: (e["year"], e["semester_key"])):
        gpa = round(entry["points"] / entry["units"], 2) if entry["units"] else Decimal("0.00")
        breakdown.append({
            "id": entry["id"],
            "name": entry["name"],
            "semester": entry["semester"],
            "gpa": gpa,
            "units": entry["units"],
            "courses": entry["courses"],
        })
    return breakdown
