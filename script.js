const sellerPhone = "5511965254522";
const form = document.querySelector("#leadForm");
const phoneInput = document.querySelector("#telefone");
const entryInput = document.querySelector("#entrada");

function onlyDigits(value) {
  return value.replace(/\D/g, "");
}

function formatPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function formatCurrency(value) {
  const digits = onlyDigits(value);

  if (!digits) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(Number(digits));
}

function getField(id) {
  return document.querySelector(`#${id}`).value.trim();
}

function buildMessage() {
  const lines = [
    "Olá, quero fazer meu pré-cadastro para o Condomínio dos Ipês em Ibiúna/SP.",
    "",
    `Nome: ${getField("nome")}`,
    `Telefone/WhatsApp: ${getField("telefone")}`,
    `E-mail: ${getField("email") || "Não informado"}`,
    `Cidade: ${getField("cidade")}`,
    `Interesse: ${getField("interesse")}`,
    `Orçamento: ${getField("orcamento")}`,
    `Forma de pagamento: ${getField("pagamento")}`,
    `Entrada disponível: ${getField("entrada") || "Não informado"}`,
    `Prazo para comprar: ${getField("prazo")}`,
    `Mensagem: ${getField("mensagem") || "Não informado"}`
  ];

  return encodeURIComponent(lines.join("\n"));
}

phoneInput.addEventListener("input", (event) => {
  event.target.value = formatPhone(event.target.value);
});

entryInput.addEventListener("input", (event) => {
  event.target.value = formatCurrency(event.target.value);
});

function visitAlreadyCounted(today) {
  try {
    return localStorage.getItem("ipes_visita_dia") === today;
  } catch {
    return false;
  }
}

function rememberVisit(today) {
  try {
    localStorage.setItem("ipes_visita_dia", today);
  } catch {
    // A visita continua contada mesmo se o navegador bloquear o armazenamento.
  }
}

async function loadVisitorCount() {
  const counter = document.querySelector("#visitorCount");

  if (!counter) {
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const alreadyCounted = visitAlreadyCounted(today);
  const action = alreadyCounted ? "get" : "hit";

  try {
    const response = await fetch(
      `https://abacus.jasoncameron.dev/${action}/condominiodosipes/visitas`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("contador");
    }

    const data = await response.json();
    const total = Number(data.value);

    if (!Number.isFinite(total)) {
      throw new Error("contador");
    }

    if (!alreadyCounted) {
      rememberVisit(today);
    }

    counter.textContent = new Intl.NumberFormat("pt-BR").format(total);
  } catch {
    counter.closest(".visitor-count")?.remove();
  }
}

loadVisitorCount();

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.reportValidity()) {
    return;
  }

  const whatsappUrl = `https://wa.me/${sellerPhone}?text=${buildMessage()}`;
  window.open(whatsappUrl, "_blank", "noopener");
});
