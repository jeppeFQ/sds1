--[[
  forklaring.lua — gør ::: {.forklaring} til en fold-ud-boks (<details>).

    ::: {.forklaring}
    1. {1} `import pandas as pd` henter biblioteket ...
    2. {2-3} De to næste linjer ...
    :::

  {1} eller {2-3} først i et punkt fortæller, hvilke kodelinjer punktet handler om.
  Når man peger på, klikker på eller tabber til punktet, fremhæves linjerne i cellen.
  Valgfri titel:  ::: {.forklaring titel="Hvad betyder fejlbeskeden?"}

  <details>/<summary> er indbygget i browseren: den kan åbnes med mus og
  tastatur (Tab + Enter/mellemrum) og læses af skærmlæsere.
]]

local standard_titel = "Forklaring af koden, trin for trin"

local function linjepunkter(blok)
  if blok.t ~= "OrderedList" and blok.t ~= "BulletList" then return blok end
  local html = { blok.t == "OrderedList" and "<ol>" or "<ul>" }
  local ud = { }
  for _, punkt in ipairs(blok.content) do
    local attr = ""
    local f = punkt[1]
    if f and (f.t == "Plain" or f.t == "Para") and f.content[1] and f.content[1].t == "Str" then
      local a, b = f.content[1].text:match("^{(%d+)%-?(%d*)}$")
      if a then
        attr = ' data-linjer="' .. a .. (b ~= "" and ("-" .. b) or "") .. '" tabindex="0"'
        f.content:remove(1)
        if f.content[1] and f.content[1].t == "Space" then f.content:remove(1) end
      end
    end
    table.insert(ud, pandoc.RawBlock("html", "<li" .. attr .. ">"))
    for _, b in ipairs(punkt) do table.insert(ud, b) end
    table.insert(ud, pandoc.RawBlock("html", "</li>"))
  end
  table.insert(ud, 1, pandoc.RawBlock("html", html[1]))
  table.insert(ud, pandoc.RawBlock("html", blok.t == "OrderedList" and "</ol>" or "</ul>"))
  return ud
end

function Div(el)
  if not el.classes:includes("forklaring") then return nil end
  if not quarto.doc.is_format("html") then return el end
  local titel = el.attributes["titel"] or standard_titel
  local blocks = {
    pandoc.RawBlock("html", '<details class="forklaring"><summary>' .. titel .. '</summary><div class="forklaring-indhold">')
  }
  for _, b in ipairs(el.content) do
    local r = linjepunkter(b)
    if r.t then table.insert(blocks, r) else for _, x in ipairs(r) do table.insert(blocks, x) end end
  end
  table.insert(blocks, pandoc.RawBlock("html", "</div></details>"))
  return blocks
end
