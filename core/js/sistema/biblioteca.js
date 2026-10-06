// Fans Of · BIBLIOTECA: catálogo visual de habilidades y objetos, con lo que tienes y lo que te falta
'use strict';

let bibTab = 'ab';  // 'ab' (habilidades) o 'eq' (objetos)

function buildBib() {
  const list = $('#bib-list');

  // Tabs: Habilidades | Objetos
  $('#bib-tabs').innerHTML = `
    <button class="bib-tab" data-tab="ab" aria-pressed="${bibTab === 'ab'}">HABILIDADES</button>
    <button class="bib-tab" data-tab="eq" aria-pressed="${bibTab === 'eq'}">OBJETOS</button>
  `;

  $('#bib-tabs').querySelectorAll('.bib-tab').forEach(b => {
    b.onclick = () => { bibTab = b.dataset.tab; play('select'); buildBib(); };
  });

  // Contenido según tab
  if (bibTab === 'ab') {
    buildBibAbilities(list);
  } else {
    buildBibItems(list);
  }
}

function buildBibAbilities(list) {
  const worn = wornSet();  // qué está equipado ya
  const items = Object.entries(ABILITIES).map(([id, def]) => {
    const equipped = SAVE.abEquip[id];  // quién lo lleva puesto
    const copies = SAVE.inv.filter(x => x.k === 'ab' && x.id === id);  // cuántas copias tienes

    return {
      id,
      name: CFG.abilities[id].name,
      desc: def.desc,
      vals: def.vals,
      rarity: CFG.abilities[id].rarity,
      owned: copies.length,
      equipped: equipped ? CFG.cards[Object.keys(SAVE.abEquip).find(k => SAVE.abEquip[k] === equipped)].name : null,
    };
  });

  // Ordenar por rareza primero, luego por nombre
  items.sort((a, b) => RAR_ORDER[a.rarity] - RAR_ORDER[b.rarity] || a.name.localeCompare(b.name));

  list.innerHTML = '<div class="bib-grid">' + items.map(it => bibAbilityCard(it)).join('') + '</div>';

  list.querySelectorAll('[data-ab-id]').forEach(card => {
    card.onclick = () => openBibAbility(card.dataset.abId);
  });
}

function bibAbilityCard(it) {
  const R = RARITY[it.rarity];
  const mid = Math.round(it.vals[1]);  // valor central
  const hasIt = it.owned > 0;

  return `
    <div class="bib-card" data-ab-id="${it.id}" style="--rc:${R[2]}" ${hasIt ? '' : 'data-locked="1"'}>
      <div class="bib-header" style="background:${R[1]}">
        <span class="bib-ic">${CFG.abilities[it.id].ic}</span>
        <span class="bib-rare ol">${R[0]}</span>
      </div>
      <div class="bib-body">
        <div class="bib-name ol">${it.name}</div>
        <div class="bib-desc">${it.desc.replace('{v}', `<b>${mid}%</b>`)}</div>
        <div class="bib-status">
          ${hasIt ? `<span class="bib-have ol">TIENES: ${it.owned}</span>` : '<span class="bib-missing">Sin obtener</span>'}
          ${it.equipped ? `<span class="bib-equipped">Lo lleva: <b>${it.equipped}</b></span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function openBibAbility(id) {
  const def = ABILITIES[id];
  const c = CFG.abilities[id];
  const R = RARITY[c.rarity];
  const equipped = SAVE.abEquip[id];
  const copies = SAVE.inv.filter(x => x.k === 'ab' && x.id === id);
  const wearer = equipped ? Object.entries(SAVE.abEquip).find(([_, u]) => u === equipped)?.[0] : null;

  let html = `
    <div class="bib-detail">
      <div class="bib-detail-header" style="background:${R[1]}">
        <span class="bib-ic" style="font-size:3em">${c.ic}</span>
        <div>
          <div class="bib-name ol">${c.name}</div>
          <div class="bib-rare ol">${R[0]}</div>
        </div>
      </div>
      <div class="bib-detail-body">
        <p class="bib-desc">${def.desc}</p>
        <div class="bib-values">
          <div>Flojo: <b>${def.vals[0]}%</b></div>
          <div>Central: <b>${def.vals[1]}%</b></div>
          <div>Fuerte: <b>${def.vals[2]}%</b></div>
        </div>
  `;

  if (copies.length > 0) {
    html += `<p class="bib-status"><b class="sv">TIENES ${copies.length} COPIA${copies.length > 1 ? 'S' : ''}</b></p>`;
    if (wearer) {
      html += `<p class="bib-equipped">La lleva: <b>${CFG.cards[wearer].name}</b></p>`;
    }
  } else {
    html += `<p class="bib-missing">Aún no la has obtenido. Sale en el <b>Gashapón</b>.</p>`;
  }

  html += `</div></div>`;

  $('#pick-title').textContent = 'HABILIDAD';
  $('#pick-list').innerHTML = html;
  show($('#scr-pick'));
}

function buildBibItems(list) {
  const items = Object.entries(ITEMS).map(([id, def]) => {
    const copies = SAVE.inv.filter(x => x.k === 'eq' && x.id === id);
    const equipped = findEquipped(id);  // quién lo lleva

    return {
      id,
      name: CFG.items[id].name,
      desc: def.desc,
      vals: def.st,
      rarity: CFG.items[id].rarity,
      slot: CFG.items[id].slot,
      fac: CFG.items[id].fac,  // si es exclusivo de una facción
      owned: copies.length,
      equippedBy: equipped,
    };
  });

  // Ordenar por rareza, luego slot, luego nombre
  items.sort((a, b) => RAR_ORDER[a.rarity] - RAR_ORDER[b.rarity] || (a.slot || '').localeCompare(b.slot || '') || a.name.localeCompare(b.name));

  list.innerHTML = '<div class="bib-grid">' + items.map(it => bibItemCard(it)).join('') + '</div>';

  list.querySelectorAll('[data-eq-id]').forEach(card => {
    card.onclick = () => openBibItem(card.dataset.eqId);
  });
}

function bibItemCard(it) {
  const R = RARITY[it.rarity];
  const mid = it.vals[0];  // primer valor
  const hasIt = it.owned > 0;
  const facName = it.fac ? CFG.cards[FACTIONS[it.fac].leader].name : null;

  return `
    <div class="bib-card" data-eq-id="${it.id}" style="--rc:${R[2]}" ${hasIt ? '' : 'data-locked="1"'}>
      <div class="bib-header" style="background:${R[1]}">
        <span class="bib-ic">${SLOT_SVG[it.slot]}</span>
        <span class="bib-rare ol">${R[0]}${facName ? ` (${facName})` : ''}</span>
      </div>
      <div class="bib-body">
        <div class="bib-name ol">${it.name}</div>
        <div class="bib-desc">${it.desc.replace('{0}', `<b>${mid}</b>`).replace('{1}', it.vals[1] ? `<b>${it.vals[1]}</b>` : '').replace('{2}', it.vals[2] ? `<b>${it.vals[2]}</b>` : '')}</div>
        <div class="bib-status">
          ${hasIt ? `<span class="bib-have ol">TIENES: ${it.owned}</span>` : '<span class="bib-missing">Sin obtener</span>'}
          ${it.equippedBy ? `<span class="bib-equipped">Lo lleva: <b>${it.equippedBy}</b></span>` : ''}
        </div>
      </div>
    </div>
  `;
}

function openBibItem(id) {
  const def = ITEMS[id];
  const c = CFG.items[id];
  const R = RARITY[c.rarity];
  const equipped = findEquipped(id);
  const copies = SAVE.inv.filter(x => x.k === 'eq' && x.id === id);
  const facName = c.fac ? CFG.cards[FACTIONS[c.fac].leader].name : null;

  let html = `
    <div class="bib-detail">
      <div class="bib-detail-header" style="background:${R[1]}">
        <span class="bib-ic" style="font-size:3em">${SLOT_SVG[c.slot]}</span>
        <div>
          <div class="bib-name ol">${c.name}</div>
          <div class="bib-rare ol">${R[0]}${facName ? ` • Exclusivo de ${facName}` : ''}</div>
        </div>
      </div>
      <div class="bib-detail-body">
        <p class="bib-desc">${def.desc}</p>
  `;

  if (copies.length > 0) {
    html += `<p class="bib-status"><b class="sv">TIENES ${copies.length} COPIA${copies.length > 1 ? 'S' : ''}</b></p>`;
    if (equipped) {
      html += `<p class="bib-equipped">Lo lleva: <b>${equipped}</b></p>`;
    }
  } else {
    html += `<p class="bib-missing">Aún no lo has obtenido. Sale en el <b>Gashapón</b>.</p>`;
  }

  html += `</div></div>`;

  $('#pick-title').textContent = 'OBJETO';
  $('#pick-list').innerHTML = html;
  show($('#scr-pick'));
}

function findEquipped(itemId) {
  // Busca si este objeto está equipado en algún líder
  for (const fac in SAVE.equip) {
    for (const slot in SAVE.equip[fac]) {
      if (SAVE.equip[fac][slot] === itemId) {
        return CFG.cards[FACTIONS[fac].leader].name;
      }
    }
  }
  return null;
}
