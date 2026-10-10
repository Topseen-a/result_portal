import { useState } from "react";
import { sendMessage } from "../api/endpoints";
import { useToast } from "../context/ToastContext";
import Modal from "./Modal";
import { Alert, Button, Input, Textarea } from "./ui";

export default function SendMessageModal({ recipient, onClose }) {
  const toast = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await sendMessage({ email: recipient.email, subject, message });
      toast(`Email sent to ${recipient.name}.`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Send email"
      description={`To ${recipient.name} <${recipient.email}>`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="send-message-form" disabled={sending}>
            {sending ? "Sending..." : "Send email"}
          </Button>
        </>
      }
    >
      <form id="send-message-form" onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Input label="Subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea label="Message" required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
      </form>
    </Modal>
  );
}
