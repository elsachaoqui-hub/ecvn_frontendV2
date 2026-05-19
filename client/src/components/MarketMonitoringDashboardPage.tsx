import { AGENTS } from '@/data/agentAggregation';

/** 6.2 市場監控儀表板：四區塊由上而下，視覺對齊 5.2 月結算（白底、slate 邊框與表格） */
export default function MarketMonitoringDashboardPage() {
  const agentName = (id: number) => AGENTS.find((a) => a.id === id)?.name ?? `代理人 #${id}`;

  const realtimeGenAlerts = [
    {
      agentId: 1,
      site: '太陽能案場 A（電號 99123456789）',
      kind: '通訊逾時',
      summary: '超過 15 分鐘未收到即時發電量回傳，狀態標記為異常。',
      lastAt: '2026-05-13 14:22',
    },
    {
      agentId: 2,
      site: '風力案場 B（電號 99876543210）',
      kind: '數值跳變',
      summary: '與前一刻度相比變化率超過門檻，需管理者覆核是否為量測異常。',
      lastAt: '2026-05-13 14:18',
    },
  ];

  const declarationAlerts = [
    {
      agentId: 1,
      batch: '2026-05-13 日內自排程',
      uploadStatus: '未於截止前上傳',
      summary: '儲能移轉前應完成之上傳時限已逾，列為待確認。',
      deadline: '2026-05-13 10:00',
    },
    {
      agentId: 3,
      batch: '2026-05-12 夜間排程補件',
      uploadStatus: '檔案校驗失敗',
      summary: '自排程檔格式／欄位與平台規範不符，需重新提交。',
      deadline: '2026-05-12 22:00',
    },
  ];

  const checkingSummary = [
    {
      agentId: 1,
      daily: '異常：2 筆 15 分鐘區間待釐清',
      monthly: '正常',
      note: '日檢核有未沖銷之灰電提示，月檢核尚未到期。',
    },
    {
      agentId: 2,
      daily: '正常',
      monthly: '異常：帳務沖銷差異',
      note: '4.2 月檢核偵測移轉量與實體電量不一致，待複核。',
    },
    {
      agentId: 3,
      daily: '異常：通訊缺漏',
      monthly: '異常：物理限制校核未過',
      note: '日／月檢核均有待處理項，建議優先指派。',
    },
  ];

  const settlementAbnormal = [
    { agentId: 1, invalidMWh: 12.4, deductionMWh: 8.1, remark: '含失效灰電與重複認列沖銷' },
    { agentId: 2, invalidMWh: 0, deductionMWh: 0, remark: '—' },
    { agentId: 3, invalidMWh: 3.2, deductionMWh: 3.2, remark: '失效量與扣除量一致' },
  ];

  const storageBenefitRows = [
    { meterNo: '99123456789', transferKWh: 128_400, storageTransferKWh: 41_200, ratioPct: 32.1 },
    { meterNo: '99876543210', transferKWh: 96_200, storageTransferKWh: 28_900, ratioPct: 30.0 },
    { meterNo: '99555111222', transferKWh: 54_800, storageTransferKWh: 19_100, ratioPct: 34.9 },
  ];

  /** 市場觀點：僅「未兌現市場承諾」計入不平衡；合約轉供量＝賣方供給承諾／買方需求承諾 */
  type MarketImbalanceRow = {
    slot: string;
    role: '賣方' | '買方';
    agentId: number;
    commitmentMWh: number;
    settledMWh: number;
    settledLabel: '結算發電量' | '結算用電量';
    imbalanceMWh: number | null;
    hasObligation: boolean;
    note: string;
  };

  const marketImbalanceRows: MarketImbalanceRow[] = [
    {
      slot: '2026-05 峰段',
      role: '賣方',
      agentId: 1,
      commitmentMWh: 420.0,
      settledMWh: 401.5,
      settledLabel: '結算發電量',
      imbalanceMWh: 18.5,
      hasObligation: true,
      note: '結算發電量＜合約轉供量，缺額賣量，具平衡義務（納入預測準確度動態檢核）',
    },
    {
      slot: '2026-05 峰段',
      role: '買方',
      agentId: 2,
      commitmentMWh: 380.0,
      settledMWh: 365.2,
      settledLabel: '結算用電量',
      imbalanceMWh: null,
      hasObligation: false,
      note: '結算用電量＜合約轉供量，實際用得比市場承諾少，無平衡義務',
    },
    {
      slot: '2026-05 離峰',
      role: '賣方',
      agentId: 2,
      commitmentMWh: 310.0,
      settledMWh: 338.4,
      settledLabel: '結算發電量',
      imbalanceMWh: null,
      hasObligation: false,
      note: '結算發電量＞合約轉供量，超額賣量屬場外餘電／躉購範圍，無平衡義務',
    },
    {
      slot: '2026-05 離峰',
      role: '買方',
      agentId: 1,
      commitmentMWh: 310.0,
      settledMWh: 326.8,
      settledLabel: '結算用電量',
      imbalanceMWh: 16.8,
      hasObligation: true,
      note: '結算用電量＞合約轉供量，超額買量，具平衡義務（納入預測準確度動態檢核）',
    },
  ];

  const penalizableImbalanceMWh = marketImbalanceRows.reduce(
    (sum, r) => sum + (r.imbalanceMWh ?? 0),
    0,
  );

  const sectionShell = 'rounded-2xl border border-slate-300 bg-white p-5 shadow-sm';
  const thRow = 'bg-slate-100 text-slate-700 text-xs font-bold';
  const td = 'px-3 py-2 text-sm text-slate-800 border-t border-slate-200';

  return (
    <div className="space-y-6 pb-8 text-slate-800">
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <h2 className="text-2xl font-black tracking-tight text-slate-900">6.2 市場監控儀表板</h2>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          彙總即時發電、申報計畫、檢核作業與結算相關異常／報表資訊，供管理者由上而下快速巡檢。下列為示範假資料，可改接監控 API。
        </p>
      </div>

      {/* 一、即時發電量監控 */}
      <section className={sectionShell}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">一、即時發電量監控</h3>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-600">
              若代理人旗下案場回傳之即時發電量狀態異常，列表呈現基本訊息，待管理者處理確認。
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-black text-rose-800">
            待確認 {realtimeGenAlerts.length} 件
          </span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-[720px] w-full">
            <thead className={thRow}>
              <tr>
                <th className="px-3 py-2 text-left">代理人</th>
                <th className="px-3 py-2 text-left">案場</th>
                <th className="px-3 py-2 text-left">異常類型</th>
                <th className="px-3 py-2 text-left">狀態摘要</th>
                <th className="px-3 py-2 text-left">最後回傳</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {realtimeGenAlerts.map((row, i) => (
                <tr key={`rt-${i}`} className="font-semibold">
                  <td className={td}>{agentName(row.agentId)}</td>
                  <td className={td}>{row.site}</td>
                  <td className={td}>
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-900">{row.kind}</span>
                  </td>
                  <td className={`${td} max-w-md`}>{row.summary}</td>
                  <td className={`${td} whitespace-nowrap text-slate-600`}>{row.lastAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 二、申報計畫監控 */}
      <section className={sectionShell}>
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">二、申報計畫監控</h3>
            <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-600">
              代理人須於實際儲能移轉前，確認自排程已如期上傳；異常時顯示摘要並待管理者確認。
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-black text-rose-800">
            待確認 {declarationAlerts.length} 件
          </span>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-[760px] w-full">
            <thead className={thRow}>
              <tr>
                <th className="px-3 py-2 text-left">代理人</th>
                <th className="px-3 py-2 text-left">排程／批次</th>
                <th className="px-3 py-2 text-left">上傳狀態</th>
                <th className="px-3 py-2 text-left">異常摘要</th>
                <th className="px-3 py-2 text-left">時限</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {declarationAlerts.map((row, i) => (
                <tr key={`dec-${i}`} className="font-semibold">
                  <td className={td}>{agentName(row.agentId)}</td>
                  <td className={td}>{row.batch}</td>
                  <td className={td}>
                    <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-900">{row.uploadStatus}</span>
                  </td>
                  <td className={`${td} max-w-md`}>{row.summary}</td>
                  <td className={`${td} whitespace-nowrap text-slate-600`}>{row.deadline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 三、檢核作業異常監控 */}
      <section className={sectionShell}>
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-lg font-bold text-slate-900">三、檢核作業異常監控</h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-600">
            各代理人帳號下，整合 4.1 日檢核與 4.2 月檢核之異常狀態，於此區綜整顯示。
          </p>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-[800px] w-full">
            <thead className={thRow}>
              <tr>
                <th className="px-3 py-2 text-left">代理人</th>
                <th className="px-3 py-2 text-left">4.1 日檢核</th>
                <th className="px-3 py-2 text-left">4.2 月檢核</th>
                <th className="px-3 py-2 text-left">綜整說明</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {checkingSummary.map((row, i) => (
                <tr key={`chk-${i}`} className="font-semibold">
                  <td className={td}>{agentName(row.agentId)}</td>
                  <td className={td}>
                    {row.daily.startsWith('正常') ? (
                      <span className="text-emerald-700">{row.daily}</span>
                    ) : (
                      <span className="text-rose-800">{row.daily}</span>
                    )}
                  </td>
                  <td className={td}>
                    {row.monthly.startsWith('正常') ? (
                      <span className="text-emerald-700">{row.monthly}</span>
                    ) : (
                      <span className="text-rose-800">{row.monthly}</span>
                    )}
                  </td>
                  <td className={`${td} text-slate-700`}>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 四、結算監控 */}
      <section className={sectionShell}>
        <div className="border-b border-slate-200 pb-4">
          <h3 className="text-lg font-bold text-slate-900">四、結算監控</h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold text-slate-600">
            異常分析報表與效益產出報表並列：前者追蹤移轉失效與結算扣除；後者呈現儲能移轉效益與市場觀點下之不平衡電量報告（作為預測準確度動態檢核獎懲依據）。
          </p>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <h4 className="text-base font-black text-slate-900">1. 異常分析報表</h4>
            <p className="mt-1 text-xs font-semibold text-slate-500">各代理人帳號：移轉電能失效量與結算扣除量</p>
            <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-[640px] w-full">
                <thead className={thRow}>
                  <tr>
                    <th className="px-3 py-2 text-left">代理人</th>
                    <th className="px-3 py-2 text-right">移轉電能失效量（MWh）</th>
                    <th className="px-3 py-2 text-right">結算扣除量（MWh）</th>
                    <th className="px-3 py-2 text-left">備註</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {settlementAbnormal.map((row, i) => (
                    <tr key={`set-ab-${i}`} className="font-semibold">
                      <td className={td}>{agentName(row.agentId)}</td>
                      <td className={`${td} text-right tabular-nums`}>{row.invalidMWh}</td>
                      <td className={`${td} text-right tabular-nums`}>{row.deductionMWh}</td>
                      <td className={`${td} text-slate-600`}>{row.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-base font-black text-slate-900">2. 效益產出報表</h4>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-bold text-slate-900">（1）儲能移轉效益</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  依檢核通過之分配結果，計算各電號轉供電量及儲能移轉電量比例。
                </p>
                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="min-w-[520px] w-full">
                    <thead className={thRow}>
                      <tr>
                        <th className="px-3 py-2 text-left">電號</th>
                        <th className="px-3 py-2 text-right">轉供電量（kWh）</th>
                        <th className="px-3 py-2 text-right">儲能移轉電量（kWh）</th>
                        <th className="px-3 py-2 text-right">比例（%）</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storageBenefitRows.map((r) => (
                        <tr key={r.meterNo} className="font-semibold">
                          <td className={td}>{r.meterNo}</td>
                          <td className={`${td} text-right tabular-nums`}>{r.transferKWh.toLocaleString()}</td>
                          <td className={`${td} text-right tabular-nums text-indigo-800`}>{r.storageTransferKWh.toLocaleString()}</td>
                          <td className={`${td} text-right tabular-nums text-emerald-800`}>{r.ratioPct.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-sm font-bold text-slate-900">（2）不平衡電量報告（市場觀點）</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">
                  僅針對「未兌現市場承諾」計入不平衡：合約轉供量即賣方供給承諾與買方需求承諾；賣方僅在結算發電量＜合約轉供量（缺額賣量）、買方僅在結算用電量＞合約轉供量（超額買量）時具平衡義務，供預測準確度動態檢核獎懲。
                </p>
                <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-semibold text-indigo-950">
                  <span className="font-black">市場觀點摘要：</span>
                  賣方超額供電、買方少於承諾用電，於市場結算上均視為無平衡義務；本表「可計罰不平衡電量」合計{' '}
                  <span className="font-black tabular-nums">{penalizableImbalanceMWh.toFixed(1)}</span> MWh。
                </div>
                <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                  <table className="min-w-[880px] w-full">
                    <thead className={thRow}>
                      <tr>
                        <th className="px-3 py-2 text-left">區間</th>
                        <th className="px-3 py-2 text-left">角色</th>
                        <th className="px-3 py-2 text-left">代理人</th>
                        <th className="px-3 py-2 text-right">合約轉供量（MWh）</th>
                        <th className="px-3 py-2 text-right">結算量（MWh）</th>
                        <th className="px-3 py-2 text-center">平衡義務</th>
                        <th className="px-3 py-2 text-right">可計罰不平衡電量（MWh）</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketImbalanceRows.map((r, i) => (
                        <tr key={`imb-${i}`} className="font-semibold">
                          <td className={td}>{r.slot}</td>
                          <td className={td}>
                            <span
                              className={`rounded-md px-2 py-0.5 text-xs font-black ${
                                r.role === '賣方' ? 'bg-sky-100 text-sky-900' : 'bg-violet-100 text-violet-900'
                              }`}
                            >
                              {r.role}
                            </span>
                          </td>
                          <td className={td}>{agentName(r.agentId)}</td>
                          <td className={`${td} text-right tabular-nums`}>{r.commitmentMWh.toFixed(1)}</td>
                          <td className={`${td} text-right tabular-nums`}>
                            <span className="block text-[10px] font-bold text-slate-500">{r.settledLabel}</span>
                            {r.settledMWh.toFixed(1)}
                          </td>
                          <td className={`${td} text-center`}>
                            {r.hasObligation ? (
                              <span className="text-xs font-black text-rose-800">有</span>
                            ) : (
                              <span className="text-xs font-bold text-slate-500">無</span>
                            )}
                          </td>
                          <td
                            className={`${td} text-right tabular-nums ${
                              r.imbalanceMWh != null ? 'font-black text-rose-800' : 'text-slate-400'
                            }`}
                          >
                            {r.imbalanceMWh != null ? r.imbalanceMWh.toFixed(1) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ul className="mt-2 space-y-1 text-xs font-semibold text-slate-600">
                  {marketImbalanceRows.map((r, i) => (
                    <li key={`imb-note-${i}`}>
                      <span className="font-black text-slate-700">
                        {r.slot} · {r.role}
                      </span>
                      ：{r.note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
