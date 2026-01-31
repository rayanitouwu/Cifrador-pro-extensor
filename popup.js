// Esperar a que el DOM cargue
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Cifrador: Listo para usar");

  const input = document.getElementById("input");
  const output = document.getElementById("output");
  const method = document.getElementById("method");
  const encryptBtn = document.getElementById("encryptBtn");
  const decryptBtn = document.getElementById("decryptBtn");
  const copyBtn = document.getElementById("copyBtn");
  const scoreSpan = document.getElementById("score");
  const barFill = document.getElementById("bar-fill");

  if (!input || !output || !method || !encryptBtn || !decryptBtn || !copyBtn || !scoreSpan || !barFill) {
    console.error("❌ Error: Algunos elementos no se encontraron en el DOM");
    return;
  }

  const methods = {
    base64: {
      encode: str => btoa(unescape(encodeURIComponent(str))),
      decode: str => {
        try {
          return decodeURIComponent(escape(atob(str)));
        } catch (e) {
          return "❌ Error Base64";
        }
      }
    },
    rot13: {
      encode: str => str.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26)),
      decode: str => str.replace(/[a-zA-Z]/g, c => String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26))
    },
    reverse: {
      encode: str => str.split("").reverse().join(""),
      decode: str => str.split("").reverse().join("")
    },
    hex: {
      encode: str => Array.from(new TextEncoder().encode(str)).map(b => b.toString(16).padStart(2, "0")).join(""),
      decode: str => {
        try {
          const hex = str.trim().replace(/[^0-9A-Fa-f]/g, "");
          if (hex.length % 2 !== 0) return "❌ Hex impar";
          const bytes = new Uint8Array(hex.length / 2);
          for (let i = 0; i < bytes.length; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
          }
          return new TextDecoder().decode(bytes);
        } catch (e) {
          return "❌ Error Hex";
        }
      }
    },
    urlencode: {
      encode: str => encodeURIComponent(str),
      decode: str => {
        try {
          return decodeURIComponent(str);
        } catch (e) {
          return "❌ Error URL";
        }
      }
    }
  };

  function evaluarSeguridad(pwd) {
    let score = 0;

    if (pwd.length >= 8) score += 2;
    if (/[A-Z]/.test(pwd)) score += 2;
    if (/[a-z]/.test(pwd)) score += 2;
    if (/\d/.test(pwd)) score += 2;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 2;

    if (pwd.length >= 12) score += 1;
    if (pwd.length >= 16) score += 1;

    if (pwd.toLowerCase().includes("123") || pwd.toLowerCase() === "password") {
      score = Math.max(score - 3, 1);
    }

    return Math.min(score, 10);
  }

  function actualizarSeguridad() {
    const pwd = input.value;
    if (!pwd) {
      scoreSpan.textContent = "-";
      barFill.style.width = "0%";
      return;
    }

    const score = evaluarSeguridad(pwd);
    scoreSpan.textContent = score;
    barFill.style.width = `${(score / 10) * 100}%`;

    if (score < 4) barFill.style.background = "#dc3545";
    else if (score < 7) barFill.style.background = "#fd7e14";
    else barFill.style.background = "#28a745";
  }

  input.addEventListener("input", actualizarSeguridad);

  encryptBtn.addEventListener("click", () => {
    const text = input.value;
    if (!text) {
      output.value = "⚠️ Escribe algo primero";
      return;
    }
    const m = method.value;
    output.value = methods[m]?.encode(text) || "❌ Método no soportado";
  });

  decryptBtn.addEventListener("click", () => {
    const text = input.value;
    if (!text) {
      output.value = "⚠️ Escribe algo primero";
      return;
    }
    const m = method.value;
    output.value = methods[m]?.decode(text) || "❌ Método no soportado";
  });

  copyBtn.addEventListener("click", () => {
    output.select();
    document.execCommand("copy");
    copyBtn.textContent = "✅ Copiado";
    setTimeout(() => {
      copyBtn.textContent = "📋 Copiar";
    }, 1500);
  });

  actualizarSeguridad();
});