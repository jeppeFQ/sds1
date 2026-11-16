--[[
  celler.lua — de tre slags interaktive celler. Kører FØR quarto-live (live.lua).

    :::: {.demo}        kører af sig selv, kan ikke redigeres
    :::: {.proev}       "Prøv selv": kan redigeres og køres
    :::: {.oevelse}     starter med huller, Hint, Vis løsning og automatisk tjek

  Valgfrit på cellen:
    forslag="..."       tekst under editoren (Prøv selv)
    gaet="..."          "gæt først"-spørgsmål;  valg="a|b|c"  giver svarmuligheder
    .side               editor og output ved siden af hinanden (sker automatisk på {.kodelab}-slides)

  Filteret skriver de nødvendige quarto-live-indstillinger ind i kodeblokken,
  så de ikke skal gentages i hver lektion.
]]

local nr = 0
local maerker = { demo = "Demo", proev = "Prøv selv", oevelse = "Øvelse" }

local function er_celle(cb)
  for _, c in ipairs({ "{pyodide}", "pyodide", "{webr}", "webr" }) do
    if cb.classes:includes(c) then return true end
  end
  return false
end

local function har(tekst, noegle)
  return tekst:match("#|%s*" .. noegle:gsub("%-", "%%-") .. "%s*:") ~= nil
end

local function tilfoej(cb, linjer)
  local nye = {}
  for _, l in ipairs(linjer) do
    if not har(cb.text, l[1]) then table.insert(nye, "#| " .. l[1] .. ": " .. l[2]) end
  end
  if #nye > 0 then cb.text = table.concat(nye, "\n") .. "\n" .. cb.text end
  return cb
end

function Div(el)
  local slags
  for k, _ in pairs(maerker) do
    if el.classes:includes(k) then slags = k end
  end
  if not slags then return nil end
  -- kun en celle, hvis der faktisk ligger en kørbar kodeblok direkte i boksen
  local fundet = false
  for _, b in ipairs(el.content) do
    if b.t == "CodeBlock" and er_celle(b) then fundet = true end
  end
  if not fundet then return nil end

  nr = nr + 1
  local id = "celle" .. nr
  el.classes:insert("celle")
  el.attributes["data-maerke"] = maerker[slags]
  el.attributes["data-celle"] = el.identifier ~= "" and el.identifier or id

  local ud = {}
  for _, b in ipairs(el.content) do
    if b.t == "CodeBlock" and er_celle(b) then
      if slags == "demo" then
        b = tilfoej(b, { { "autorun", "true" }, { "edit", "false" } })
      elseif slags == "proev" then
        b = tilfoej(b, { { "autorun", "false" }, { "caption", "Prøv selv" } })
      else
        b = tilfoej(b, { { "exercise", id }, { "envir", "global" } })
        if not har(b.text, "check") then b = tilfoej(b, { { "caption", "Øvelse" } }) end
      end
      table.insert(ud, b)
    elseif b.t == "Div" and b.classes:includes("hint") then
      b.classes = pandoc.List({ "hjaelp-panel" })
      b.attributes["data-slags"] = "hint"
      table.insert(ud, b)
    elseif b.t == "Div" and b.classes:includes("loesning") then
      b.classes = pandoc.List({ "hjaelp-panel" })
      b.attributes["data-slags"] = "loesning"
      table.insert(ud, b)
    else
      table.insert(ud, b)
    end
  end

  if el.attributes["forslag"] then
    local blokke = pandoc.read(el.attributes["forslag"], "markdown").blocks
    table.insert(ud, pandoc.Div(blokke, pandoc.Attr("", { "forslag" })))
    el.attributes["forslag"] = nil
  end
  if el.attributes["gaet"] then
    el.classes:insert("gaet")
    el.attributes["data-gaet"] = el.attributes["gaet"]
    el.attributes["data-valg"] = el.attributes["valg"] or ""
    el.attributes["gaet"] = nil
    el.attributes["valg"] = nil
  end
  el.content = ud
  return el
end
