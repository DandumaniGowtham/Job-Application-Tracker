
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator, field_validator



ApplicationStatus = Literal[
    "SAVED",
    "APPLIED",
    "SCREENING",
    "INTERVIEW",
    "OFFER",
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
]


class ApplicationCreate(BaseModel):
    company_name: str
    job_title: str
    location: str
    employment_type: str
    source: str
    job_url: str | None = None
    salary_min: Decimal | None = Field(default=None, ge=0)
    salary_max: Decimal | None = Field(default=None, ge=0)
    applied_date: date
    status: ApplicationStatus = "APPLIED"

    @model_validator(mode="after")
    def validate_application(self):
        if (
            self.salary_min is not None
            and self.salary_max is not None
            and self.salary_min > self.salary_max
        ):
            raise ValueError("salary_min cannot exceed salary_max")

        if self.applied_date > date.today():
            raise ValueError("applied_date cannot be in the future")

        return self


class ApplicationUpdate(BaseModel):
    company_name: str | None = None
    job_title: str | None = None
    location: str | None = None
    employment_type: str | None = None
    source: str | None = None
    job_url: str | None = None
    salary_min: Decimal | None = Field(default=None, ge=0)
    salary_max: Decimal | None = Field(default=None, ge=0)
    applied_date: date | None = None
    status: ApplicationStatus | None = None

    @model_validator(mode="after")
    def validate_salary_range(self):
        if (
            self.salary_min is not None
            and self.salary_max is not None
            and self.salary_min > self.salary_max
        ):
            raise ValueError("salary_min cannot exceed salary_max")
        return self


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus

    @field_validator("status", mode="before")
    @classmethod
    def validate_status(cls, value):
        allowed_statuses = [
            "SAVED", "APPLIED", "SCREENING", "INTERVIEW",
            "OFFER", "ACCEPTED", "REJECTED", "WITHDRAWN"
        ]

        if value not in allowed_statuses:
            raise ValueError(
                "Invalid input. Expected one of: "
                "'SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', "
                "'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'."
            )

        return value


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    job_title: str
    location: str
    employment_type: str
    source: str
    job_url: str | None
    salary_min: Decimal | None
    salary_max: Decimal | None
    applied_date: date
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
