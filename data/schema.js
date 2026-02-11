/**
 * ═══════════════════════════════════════════════════════════════
 * TDSP Schema Definition — data/schema.js
 * ═══════════════════════════════════════════════════════════════
 * 
 * 이 파일은 TDSP 플랫폼의 모든 스키마 정의를 중앙에서 관리합니다.
 * 스키마를 수정하면 아래 항목이 자동으로 반영됩니다:
 *   - 스키마 탭 (표시)
 *   - AI 파싱 프롬프트 (Claude API 호출)
 *   - 수동 입력 폼 (필드 구성)
 *   - 상세 보기 (데이터 표시)
 *   - 필터 드롭다운 (선택지)
 * 
 * 확장 가이드:
 *   1. 새 test_type 추가    → SCHEMA.enums.test_type 배열에 추가
 *   2. 새 공통 필드 추가     → SCHEMA.layers.common.fields 배열에 추가
 *   3. 새 모듈 스키마 추가   → SCHEMA.modules 에 새 키 추가
 *   4. 미래 전사 스키마 추가  → SCHEMA.domains 에 새 도메인 추가 (Phase 2+)
 * 
 * Version: 1.0
 * Updated: 2026-02-12
 * ═══════════════════════════════════════════════════════════════
 */

const SCHEMA = {

  version: '1.0',

  // ──────────────────────────────
  // Enum 정의 (드롭다운, 필터, 검증에 사용)
  // ──────────────────────────────
  enums: {
    test_type: ['Comparative', 'Performance', 'Functional', 'Reliability', 'Safety', 'EMC', 'Environmental', 'Other'],
    result_summary: ['Pass', 'Fail', 'Conditional', 'Informational'],
    report_type: ['Detailed Report', 'Monthly Report', 'Summary', 'Raw Data'],
    source_format: ['PPT', 'Excel', 'Word'],
  },

  // ──────────────────────────────
  // 3-Layer 스키마 정의
  // ──────────────────────────────
  layers: {

    // Layer 1: 공통 (절대 변경 금지 영역)
    common: {
      label: 'Layer 1 — 공통 스키마 (Common)',
      color: 'var(--blue)',
      bg: '#0a1530',
      border: '#1e3a5f',
      desc: '모든 테스트에 공통 — 검색, 필터링의 기준. 변경 금지.',
      fields: [
        { key: 'test_id',        type: 'String (PK)',    required: true,  desc: '고유 테스트 식별자', placeholder: 'QB-FAN-2025-001', formType: 'text' },
        { key: 'project_name',   type: 'String',         required: true,  desc: '프로젝트 명칭', placeholder: 'QB Project', formType: 'text' },
        { key: 'test_category',  type: 'String',         required: true,  desc: '테스트 모듈/영역', placeholder: 'Thermocycling Module', formType: 'text', defaultValue: 'Thermocycling Module' },
        { key: 'test_type',      type: 'Enum',           required: true,  desc: '테스트 유형', formType: 'select', enumKey: 'test_type' },
        { key: 'test_date',      type: 'Date',           required: true,  desc: 'YYYY-MM-DD', formType: 'date' },
        { key: 'result_summary', type: 'Enum',           required: true,  desc: '결과 요약', formType: 'select', enumKey: 'result_summary' },
        { key: 'engineer_name',  type: 'String',         required: true,  desc: '담당 엔지니어', placeholder: 'Jongtack Byeon', formType: 'text' },
        { key: 'report_type',    type: 'Enum',           required: false, desc: '리포트 유형', formType: 'select', enumKey: 'report_type' },
        { key: 'project_phase',  type: 'String',         required: false, desc: '프로젝트 단계 (Alpha, Beta1 등)', placeholder: 'Beta1', formType: 'text' },
        { key: 'original_files', type: 'Array<String>',  required: false, desc: '원본 파일명 (쉼표 구분)', placeholder: 'Report.pptx, Data.xlsx', formType: 'text' },
        { key: 'source_format',  type: 'String',         required: false, desc: '원본 포맷', formType: 'select', enumKey: 'source_format' },
        { key: 'tags',           type: 'Array<String>',  required: false, desc: '검색용 태그 (쉼표 구분)', placeholder: 'fan-noise, MHS, heatsink', formType: 'text' },
        { key: 'notes',          type: 'Text',           required: false, desc: '핵심 결론 및 특이사항', placeholder: '핵심 결론 및 특이사항...', formType: 'textarea' },
        { key: 'schema_version', type: 'String',         required: false, desc: '스키마 버전 (확장 대비)', formType: 'hidden', defaultValue: '1.0' },
      ],
    },

    // Layer 2: 유연 (존재하되 내부 자유)
    flexible: {
      label: 'Layer 2 — 유연 스키마 (Flexible)',
      color: 'var(--purple)',
      bg: '#1a1230',
      border: '#581c87',
      desc: '존재하되 내부 JSON 구조는 자유. 테스트마다 내용이 다름.',
      fields: [
        { key: 'dut_info',        type: 'JSON Object', required: false, desc: 'Device Under Test — module, heatsink_design, fan_model 등 자유', placeholder: '{"module":"Thermocycling Module","heatsink_design":"Fin Type"}', formType: 'json' },
        { key: 'test_conditions', type: 'JSON Object', required: false, desc: '테스트 조건 — unit_level, software, protocol, pwm_control 등 자유', placeholder: '{"unit_level":"Module","software":"BlinkX 2.0","pwm_control":"Feedback"}', formType: 'json' },
        { key: 'measurements',    type: 'JSON Array',  required: false, desc: '측정 결과 — [{item, value, unit, condition, spec, verdict}]', placeholder: '[{"item":"Noise Level","value":52.61,"unit":"dB","condition":"PWM50 avg","verdict":"Pass"}]', formType: 'json-array' },
      ],
    },

    // Layer 3: 전용 (custom_fields — 모듈별 다름)
    custom: {
      label: 'Layer 3 — 전용 스키마 (custom_fields)',
      color: 'var(--accent)',
      bg: '#1f0f05',
      border: '#7c2d12',
      desc: '테스트 카테고리별 전용 필드. 모듈마다 다른 custom_fields 사용.',
      // fields는 modules에서 동적으로 결정
    },
  },

  // ──────────────────────────────
  // 모듈별 custom_fields 정의
  // ──────────────────────────────
  modules: {

    'Thermocycling Module': {
      label: 'TCM (Thermocycling Module)',
      icon: '🔥',
      fields: [
        { key: 'evaluation_purpose',   type: 'String',       desc: '평가 목적' },
        { key: 'evaluation_priority',  type: 'String',       desc: '평가 우선순위 (예: Noise → OP time → HS temp)' },
        { key: 'pcr_protocol',         type: 'JSON Object',  desc: 'PCR 프로토콜 — targets, cycles, pre_heating' },
        { key: 'comparison_targets',   type: 'JSON Array',   desc: '비교 대상 — [{name, category, results: {...}, label}]' },
        { key: 'design_factors',       type: 'JSON Object',  desc: '설계 인자 — heat_capacity, thermal_resistance 등' },
        { key: 'statistical_analysis', type: 'JSON Array',   desc: '통계 분석 — [{factor, r, R2, p_value, context}]' },
        { key: 'simulation_results',   type: 'JSON Object',  desc: 'CFD/Simulation — method, peltier_load, results' },
        { key: 'failure_analysis',     type: 'JSON Object',  desc: '고장 분석 (해당 시) — root_cause, component' },
        { key: 'best_candidate',       type: 'String',       desc: '최종 선정 후보' },
        { key: 'key_findings',         type: 'Array<String>', desc: '핵심 발견사항 목록' },
      ],
    },

    // ── 미래 모듈 (Phase 2+에서 활성화) ──

    'Optical Module': {
      label: 'Optical Module',
      icon: '🔬',
      disabled: true,  // 아직 비활성
      fields: [
        { key: 'channels',              type: 'JSON Array',   desc: '채널별 데이터 — [{ch, wavelength_nm, led_power_mW, snr}]' },
        { key: 'detector_type',         type: 'String',       desc: '검출기 유형' },
        { key: 'calibration_method',    type: 'String',       desc: '교정 방법' },
        { key: 'crosstalk_matrix',      type: 'JSON Array',   desc: '크로스토크 매트릭스' },
        { key: 'optical_path_length_mm',type: 'Number',       desc: '광경로 길이 (mm)' },
      ],
    },

    'Pressure Module': {
      label: 'Pressure Module',
      icon: '🔧',
      disabled: true,
      fields: [
        { key: 'pressure_range',  type: 'String', desc: '압력 범위' },
        { key: 'accuracy',        type: 'String', desc: '정확도' },
        { key: 'response_time',   type: 'String', desc: '응답 시간' },
        { key: 'seal_test_result',type: 'String', desc: '씰 테스트 결과' },
      ],
    },
  },

  // ──────────────────────────────
  // 미래 도메인 (Phase 2+: 전사 플랫폼 확장)
  // ──────────────────────────────
  domains: {
    test_data: {
      label: '테스트 데이터',
      icon: '🧪',
      active: true,
      desc: '현재 활성 — 테스트 결과 표준화 및 관리',
    },
    project_management: {
      label: '프로젝트 관리',
      icon: '📋',
      active: false,
      desc: '프로젝트 목록, 담당자 할당, 세부 업무, Issue 관리',
      planned_entities: ['projects', 'tasks', 'issues', 'milestones'],
    },
    report_management: {
      label: '리포트 관리',
      icon: '📝',
      active: false,
      desc: 'Weekly/Monthly 리포트 기록 및 관리',
      planned_entities: ['weekly_reports', 'monthly_reports'],
    },
    meeting_management: {
      label: '미팅 관리',
      icon: '🤝',
      active: false,
      desc: '미팅 기록, Action Items, 후속 조치 추적',
      planned_entities: ['meetings', 'action_items', 'decisions'],
    },
  },

};


// ═══════════════════════════════════════════════════════════════
// 스키마 헬퍼 함수 — index.html에서 호출
// ═══════════════════════════════════════════════════════════════

/**
 * 현재 활성 모듈의 custom_fields 정의를 반환
 */
function getModuleFields(category) {
  const mod = SCHEMA.modules[category];
  return mod && !mod.disabled ? mod.fields : [];
}

/**
 * AI 파싱용 시스템 프롬프트를 동적으로 생성
 */
function buildAIPrompt() {
  // Layer 1
  const l1 = SCHEMA.layers.common.fields
    .filter(f => f.formType !== 'hidden')
    .map(f => `  "${f.key}": "${f.type}${f.required ? ' (required)' : ''} — ${f.desc}"`)
    .join(',\n');

  // Layer 2
  const l2 = SCHEMA.layers.flexible.fields
    .map(f => `  "${f.key}": "${f.type} — ${f.desc}"`)
    .join(',\n');

  // Layer 3 (active modules only)
  let l3 = '';
  for (const [cat, mod] of Object.entries(SCHEMA.modules)) {
    if (mod.disabled) continue;
    const fields = mod.fields.map(f => `    "${f.key}": "${f.type} — ${f.desc}"`).join(',\n');
    l3 += `\nFor ${cat} tests, include "custom_fields" with ANY of these that apply:\n{\n  "custom_fields": {\n${fields}\n  }\n}\n`;
  }

  return `You are a test data extraction assistant for the TDSP (Test Data Standardization Platform). Extract structured test data from the provided file content using the 3-Layer schema and return ONLY valid JSON.

=== LAYER 1: COMMON ===
{
${l1},
  "schema_version": "${SCHEMA.version}"
}

=== LAYER 2: FLEXIBLE (free-form JSON) ===
{
${l2}
}

=== LAYER 3: CUSTOM FIELDS (test-category specific) ===
${l3}
RULES:
- Use "Comparative" as test_type when multiple designs/fans/conditions are compared
- Extract comparison tables into custom_fields.comparison_targets array
- Extract statistical data (correlation, regression, p-values) into statistical_analysis
- Include speaker notes conclusions in notes field (Korean OK)
- test_date from document date
- For Monthly Reports, focus on the QB Project section
- Return ONLY valid JSON, no markdown fences
- One JSON object per file (or array if truly distinct tests)`;
}

/**
 * 수동 입력 폼 HTML을 동적으로 생성
 */
function buildManualFormHTML() {
  const fields = SCHEMA.layers.common.fields;
  let html = '';

  // 2열 그룹핑 (required 필드끼리, optional끼리)
  const pairs = [];
  let buf = [];
  for (const f of fields) {
    if (f.formType === 'hidden') continue;
    if (f.formType === 'textarea') { if (buf.length) { pairs.push(buf); buf = []; } pairs.push([f]); continue; }
    buf.push(f);
    if (buf.length === 2) { pairs.push(buf); buf = []; }
  }
  if (buf.length) pairs.push(buf);

  for (const group of pairs) {
    if (group.length === 1 && group[0].formType === 'textarea') {
      const f = group[0];
      html += `<div class="fg"><label class="fl">${f.desc}${f.required ? ' *' : ''}</label><textarea class="fta" id="f_${f.key}" style="font-family:var(--kr);font-size:12.5px" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''}></textarea></div>`;
    } else {
      html += '<div class="frow">';
      for (const f of group) {
        html += `<div class="fg"><label class="fl">${f.desc}${f.required ? ' *' : ''}</label>`;
        if (f.formType === 'select') {
          const opts = SCHEMA.enums[f.enumKey] || [];
          html += `<select class="fi" id="f_${f.key}" ${f.required ? 'required' : ''}><option value="">선택</option>${opts.map(o => `<option>${o}</option>`).join('')}</select>`;
        } else if (f.formType === 'date') {
          html += `<input type="date" class="fi" id="f_${f.key}" ${f.required ? 'required' : ''}>`;
        } else {
          html += `<input class="fi" id="f_${f.key}" placeholder="${f.placeholder || ''}" ${f.required ? 'required' : ''} ${f.defaultValue ? 'value="' + f.defaultValue + '"' : ''}>`;
        }
        html += '</div>';
      }
      html += '</div>';
    }
  }

  // Layer 2 fields
  for (const f of SCHEMA.layers.flexible.fields) {
    const isArray = f.type.includes('Array');
    html += `<div class="fg"><label class="fl">${f.desc}</label>`;
    if (isArray) {
      html += `<textarea class="fta" id="f_${f.key}" placeholder='${f.placeholder || ''}'></textarea>`;
    } else {
      html += `<input class="fi" id="f_${f.key}" style="font-family:var(--mono);font-size:11.5px" placeholder='${f.placeholder || ''}'>`;
    }
    html += '</div>';
  }

  // Layer 3 custom_fields
  html += `<div class="fg"><label class="fl" style="color:var(--accent)">Custom Fields (JSON — 모듈 전용)</label><textarea class="fta" id="f_custom_fields" style="min-height:90px" placeholder='{"evaluation_purpose":"...","comparison_targets":[...],"key_findings":[...]}'></textarea></div>`;

  return html;
}

/**
 * 폼에서 데이터를 수집하여 JSON entry 생성
 */
function collectFormData() {
  const entry = {};

  // Layer 1
  for (const f of SCHEMA.layers.common.fields) {
    const el = document.getElementById('f_' + f.key);
    if (!el) { if (f.defaultValue) entry[f.key] = f.defaultValue; continue; }
    let val = el.value.trim();
    if (f.type.includes('Array') && typeof val === 'string') {
      val = val.split(',').map(s => s.trim()).filter(Boolean);
    }
    entry[f.key] = val || f.defaultValue || '';
  }

  // Layer 2
  for (const f of SCHEMA.layers.flexible.fields) {
    const el = document.getElementById('f_' + f.key);
    if (!el) continue;
    const raw = el.value.trim();
    try { entry[f.key] = raw ? JSON.parse(raw) : (f.type.includes('Array') ? [] : {}); }
    catch (e) { entry[f.key] = f.type.includes('Array') ? [] : {}; }
  }

  // Layer 3
  const cfEl = document.getElementById('f_custom_fields');
  if (cfEl && cfEl.value.trim()) {
    try { entry.custom_fields = JSON.parse(cfEl.value.trim()); } catch (e) { entry.custom_fields = {}; }
  }

  return entry;
}

/**
 * 필터 드롭다운용 test_type 옵션 HTML 생성
 */
function buildFilterOptions(enumKey) {
  return SCHEMA.enums[enumKey].map(v => `<option>${v}</option>`).join('');
}

/**
 * 상세 보기에서 custom_fields 렌더링
 */
function renderCustomFieldsDetail(d) {
  if (!d.custom_fields || !Object.keys(d.custom_fields).length) return '';

  const cf = d.custom_fields;
  let html = `<div class="dsec full" style="background:${SCHEMA.layers.custom.bg};border-color:${SCHEMA.layers.custom.border}">`;
  html += `<div class="stit" style="color:var(--accent)">Layer 3 — Custom Fields (${d.test_category || 'TCM'})</div>`;

  // Simple string fields
  const simpleKeys = ['evaluation_purpose', 'evaluation_priority', 'best_candidate'];
  const simpleLabels = { evaluation_purpose: '평가 목적', evaluation_priority: '평가 우선순위', best_candidate: '최종 후보' };
  const simpleColors = { evaluation_priority: 'var(--accent)', best_candidate: 'var(--pass)' };
  for (const k of simpleKeys) {
    if (cf[k]) html += `<div class="irow"><span class="ilbl">${simpleLabels[k]}</span><span class="ival" style="${simpleColors[k] ? 'color:' + simpleColors[k] : ''}">${_esc(cf[k])}</span></div>`;
  }

  // Comparison targets table
  if ((cf.comparison_targets || []).length) {
    html += `<div style="margin-top:12px"><div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">비교 대상 (${cf.comparison_targets.length}건)</div>`;
    html += `<table class="mtbl"><thead><tr><th>이름</th><th>카테고리</th><th>결과 요약</th><th>라벨</th></tr></thead><tbody>`;
    for (const ct of cf.comparison_targets) {
      const res = ct.results ? Object.entries(ct.results).slice(0, 3).map(([k, v]) => k + ': ' + v).join(', ') + (Object.keys(ct.results).length > 3 ? ' ...' : '') : '';
      html += `<tr><td style="color:var(--t1);font-size:12px">${_esc(ct.name || '')}</td><td style="color:var(--t3)">${_esc(ct.category || '')}</td><td style="font-family:var(--mono);font-size:10px;color:var(--t2)">${res}</td><td style="color:var(--accent);font-size:11px">${_esc(ct.label || '')}</td></tr>`;
    }
    html += '</tbody></table></div>';
  }

  // Statistical analysis table
  if ((cf.statistical_analysis || []).length) {
    html += `<div style="margin-top:12px"><div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">통계 분석</div>`;
    html += `<table class="mtbl"><thead><tr><th>Factor</th><th>r</th><th>R²</th><th>p-value</th><th>Context</th></tr></thead><tbody>`;
    for (const s of cf.statistical_analysis) {
      html += `<tr><td style="color:var(--t1)">${_esc(s.factor || '')}</td><td style="font-family:var(--mono);font-size:11px">${s.r != null ? s.r : ''}</td><td style="font-family:var(--mono);font-size:11px">${s.R2 != null ? s.R2 : ''}</td><td style="font-family:var(--mono);font-size:11px;color:${s.p_value < 0.05 ? 'var(--pass)' : 'var(--t3)'}">${s.p_value != null ? s.p_value : ''}</td><td style="color:var(--t3)">${_esc(s.context || '')}</td></tr>`;
    }
    html += '</tbody></table></div>';
  }

  // Key findings
  if ((cf.key_findings || []).length) {
    html += `<div style="margin-top:12px"><div style="font-size:10px;color:var(--t3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px">핵심 발견사항</div>`;
    for (const f of cf.key_findings) html += `<div style="padding:4px 0;font-size:12px;color:var(--t2)">• ${_esc(f)}</div>`;
    html += '</div>';
  }

  html += '</div>';
  return html;
}

// escape helper (duplicated here so schema.js can work standalone)
function _esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
