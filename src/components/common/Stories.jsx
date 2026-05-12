export default function Stories() {
  const pets = [
    { name: "Your Story", img: "https://placedog.net/200/200?id=1", isOwn: true },
    { name: "Luna", img: "https://placedog.net/200/200?id=2" },
    { name: "Rocky", img: "https://placedog.net/200/200?id=3" },
    { name: "Rio", img: "https://placedog.net/200/200?id=4" },
    { name: "Mochi", img: "https://placedog.net/200/200?id=5" },
    { name: "Snowball", img: "https://placedog.net/200/200?id=6" },
  ];

  return (
    <div style={{ padding: "16px 0 8px" }}>
      <div
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          padding: "16px 20px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "20px",
            overflowX: "auto",
            paddingBottom: "4px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {pets.map((pet) => (
            <div
              key={pet.name}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: "64px",
                cursor: "pointer",
              }}
            >
              {/* Ring */}
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  padding: "2.5px",
                  background: pet.isOwn
                    ? "rgba(255,255,255,0.15)"
                    : "linear-gradient(135deg, #22c578 0%, #a3e635 50%, #eab308 100%)",
                  boxShadow: pet.isOwn
                    ? "none"
                    : "0 0 16px rgba(34,197,120,0.35)",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    padding: "2px",
                    background: "#0d1117",
                  }}
                >
                  <img
                    src={pet.img}
                    alt={pet.name}
                    style={{
                      borderRadius: "50%",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
                {pet.isOwn && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0px",
                      right: "0px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #22c578, #16a34a)",
                      border: "2px solid #0d1117",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: "#0d1117",
                      fontWeight: 900,
                      lineHeight: 1,
                    }}
                  >
                    +
                  </div>
                )}
              </div>

              <span
                style={{
                  fontSize: "0.68rem",
                  marginTop: "8px",
                  textAlign: "center",
                  width: "64px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: pet.isOwn ? "rgba(107,114,128,0.9)" : "rgba(209,213,219,0.85)",
                  fontWeight: pet.isOwn ? 400 : 500,
                  letterSpacing: "0.01em",
                }}
              >
                {pet.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}