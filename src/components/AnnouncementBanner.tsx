export function AnnouncementBanner() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 px-2 pt-2">
      <div
        className="marquee-banner mx-auto max-w-5xl overflow-hidden rounded-xl py-2"
        style={{
          background: "#111111",
          color: "#00AAFF",
          boxShadow: "0 0 12px rgba(0,170,255,0.45), inset 0 0 6px rgba(0,170,255,0.15)",
        }}
      >
        <div className="marquee-track whitespace-nowrap text-sm font-medium">
          <span className="px-8">
            📢 Join us on Telegram for updates!{" "}
            <a
              href="https://t.me/LittleSinghamChannel"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2"
            >
              Click here to join our channel.
            </a>
          </span>
          <span className="px-8" aria-hidden="true">
            📢 Join us on Telegram for updates!{" "}
            <a
              href="https://t.me/LittleSinghamChannel"
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-2"
            >
              Click here to join our channel.
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
