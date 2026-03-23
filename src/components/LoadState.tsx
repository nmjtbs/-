import type { LoadStateModel } from "../types/models";

interface LoadStateProps extends LoadStateModel {
  message: string;
}

export default function LoadState({
  type,
  message,
  requestId,
}: LoadStateProps) {
  const title =
    type === "loading"
      ? "Loading"
      : type === "error"
        ? "Error"
        : type === "not-found"
          ? "Not Found"
          : "Empty";

  return (
    <div className="section-card">
      <div className="section-card-body" style={{ paddingTop: "24px" }}>
        <div
          className="warning-item"
          data-tone={type === "error" || type === "not-found" ? "danger" : "warning"}
        >
          <div>
            <strong>{title}</strong>
            <div className="small">{message}</div>
            {requestId ? (
              <div className="small">Request ID: {requestId}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
