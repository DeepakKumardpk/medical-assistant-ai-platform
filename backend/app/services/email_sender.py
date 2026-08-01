from abc import ABC, abstractmethod

from sqlalchemy.orm import Session

from app.db.models.email_log import EmailLog


class EmailSender(ABC):
    @abstractmethod
    def send(self, db: Session, *, to: str, subject: str, body: str) -> EmailLog: ...


class LogOnlyEmailSender(EmailSender):
    """Iteration-1 placeholder: no real credentials/provider configured yet,
    so this writes to email_log instead of sending anything. Swap in a real
    EmailSender subclass (SMTP/SendGrid/etc.) later without touching callers."""

    def send(self, db: Session, *, to: str, subject: str, body: str) -> EmailLog:
        entry = EmailLog(to_address=to, subject=subject, body=body, status="logged")
        db.add(entry)
        db.flush()
        return entry


def get_email_sender() -> EmailSender:
    return LogOnlyEmailSender()
