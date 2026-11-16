--[[
  sds1.lua — binder designsystemet sammen.

  1. Henter resources/ (CSS, JS, skrifter, grafik) ind ÉN gang for hele sitet.
  2. Sætter lektionens accentfarve ud fra  accent: turkis  i YAML.
  3. Oversætter slide-klasser til layouts:
       # Sektion                 → sektionsslide med stort nummer (01, 02 ...)
       ## Titel {.udsagn}        → én stor sætning
       ## Titel {.kodelab}       → cellen fylder slidet
       ## Titel {.opgave}        → opgave + timer til venstre, editor til højre
       ## Sidst i dag {.sidst}   → afslutning
  4. Ordliste:  [DataFrame]{.ord}  slår ordet op i _ordliste.yml i projektets rod.
  5. Nedtælling: [3 min]{.timer tid=180}
]]

local accenter = { lyseblaa = true, turkis = true, orange = true, lilla = true, gul = true }
local layouts = { udsagn = "lay-udsagn", kodelab = "lay-kodelab", opgave = "lay-opgave", sidst = "lay-sidst" }
local sektion = 0
local ordliste = nil

local function hent_ordliste()
  if ordliste then return ordliste end
  ordliste = {}
  local rod = quarto.project.directory or "."
  local f = io.open(pandoc.path.join({ rod, "_ordliste.yml" }), "r")
  if not f then return ordliste end
  for linje in f:lines() do
    local ord, forkl = linje:match('^([^#:][^:]-):%s*(.+)$')
    if ord then
      forkl = forkl:gsub('^"(.*)"$', "%1"):gsub("^'(.*)'$", "%1")
      ordliste[pandoc.text.lower(ord)] = forkl
    end
  end
  f:close()
  return ordliste
end

function Meta(meta)
  if not quarto.doc.is_format("html") then return nil end
  quarto.doc.add_html_dependency({
    name = "sds1-skrift", version = "2.0.0",
    stylesheets = { "resources/skrift.css" },
    resources = (function()
      local t = {}
      for _, n in ipairs({ "barlow-latin-400-normal", "barlow-latin-400-italic", "barlow-latin-500-normal", "barlow-latin-500-italic",
                           "barlow-latin-600-normal", "barlow-latin-600-italic", "barlow-latin-700-normal", "barlow-latin-700-italic",
                           "jetbrains-mono-latin-400-normal", "jetbrains-mono-latin-700-normal" }) do
        table.insert(t, { name = "skrift/" .. n .. ".woff2", path = "resources/skrift/" .. n .. ".woff2" })
      end
      return t
    end)()
  })
  if not quarto.doc.is_format("revealjs") then return nil end
  quarto.doc.add_html_dependency({
    name = "sds1-slides", version = "2.0.0",
    stylesheets = { "resources/design.css" },
    scripts = { "resources/qrcode.js", "resources/sds1.js", "resources/figurer.js" },
    resources = {
      { name = "grafik/aau-logo.png", path = "resources/grafik/aau-logo.png" },
      { name = "grafik/aau-logo-hvid.png", path = "resources/grafik/aau-logo-hvid.png" },
      { name = "grafik/boelge-blaa.webp", path = "resources/grafik/boelge-blaa.webp" },
      { name = "grafik/boelge-hvid.webp", path = "resources/grafik/boelge-hvid.webp" },
    }
  })
  local accent = meta.accent and pandoc.utils.stringify(meta.accent) or "lyseblaa"
  if not accenter[accent] then
    quarto.log.warning("sds1: ukendt accent '" .. accent .. "'. Brug lyseblaa, turkis, orange, lilla eller gul.")
    accent = "lyseblaa"
  end
  -- Sættes før første tegning, så siden ikke blinker i forkert farve eller tema
  quarto.doc.include_text("in-header",
    '<script>(function(){var h=document.documentElement;h.dataset.accent="' .. accent ..
    '";try{var t=localStorage.getItem("sds1:tema");if(t==="moerk")h.dataset.tema="moerk";}catch(e){}})();</script>')
  return nil
end

function Header(el)
  if not quarto.doc.is_format("revealjs") then return nil end
  if el.level == 1 then
    sektion = sektion + 1
    el.classes:insert("lay-sektion")
    el.attributes["data-nr"] = string.format("%02d", sektion)
    return el
  end
  if el.level == 2 then
    for kort, lang in pairs(layouts) do
      if el.classes:includes(kort) then el.classes:insert(lang) end
    end
    return el
  end
end

function Span(el)
  if el.classes:includes("ord") then
    if el.attributes["data-forklaring"] then return nil end      -- allerede slået op
    local noegle = pandoc.text.lower(el.attributes["ord"] or pandoc.utils.stringify(el.content))
    local forkl = hent_ordliste()[noegle]
    if not forkl then
      quarto.log.warning("sds1: '" .. noegle .. "' står ikke i _ordliste.yml")
      return el.content
    end
    el.attributes["ord"] = nil
    el.attributes["data-ord"] = pandoc.utils.stringify(el.content)
    el.attributes["data-forklaring"] = forkl
    el.attributes["tabindex"] = "0"
    return el
  end
  if el.classes:includes("timer") and el.attributes["tid"] then
    return pandoc.RawInline("html", '<span class="timer" data-time="' .. el.attributes["tid"] .. '"></span>')
  end
end
