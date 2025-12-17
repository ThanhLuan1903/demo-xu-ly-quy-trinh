"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/protected-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { ProcessDetail } from "@/app/types/process";
import { LoadingSpinner } from "@/components/loading";

function joinTexts(items: Array<{ actor_text: string }>) {
  const uniq = Array.from(
    new Set((items || []).map((x) => x.actor_text).filter(Boolean))
  );
  return uniq.join(", ");
}

function uniqForms<
  T extends {
    id?: string;
    form_code: string;
    form_name?: string | null;
    url_file?: string | null;
  }
>(items: T[]) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items || []) {
    const key = it.id || it.form_code;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

export default function ProcessDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<ProcessDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const processId = String(params?.id || "");

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/processes/${encodeURIComponent(processId)}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Fetch failed");
      setData(json);
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!processId) return;
    fetchDetail();
  }, [processId]);

  const rows = useMemo(() => {
    if (!data) return [];
    const out: Array<{
      step_no: number;
      step_name: string;
      sub_no: number;
      work_content: string;
      performers: string;
      coordinators: string;
      expected_result: string;
      due_days: string;
      forms: string;
      url_file: string;
      rowSpan: number;
      isFirstRowOfStep: boolean;
    }> = [];

    for (const st of data.steps || []) {
      const subs = (st.sub_steps || [])
        .slice()
        .sort((a, b) => (a.sub_no ?? 0) - (b.sub_no ?? 0));
      const span = Math.max(1, subs.length);

      if (subs.length === 0) {
        out.push({
          step_no: st.step_no,
          step_name: st.step_name,
          sub_no: 0,
          work_content: "",
          performers: "",
          coordinators: "",
          expected_result: "",
          due_days: "",
          forms: "",
          url_file: "",
          rowSpan: 1,
          isFirstRowOfStep: true,
        });
        continue;
      }

      subs.forEach((ss, idx) => {
        out.push({
          step_no: st.step_no,
          step_name: st.step_name,
          sub_no: ss.sub_no,
          work_content: ss.work_content,
          performers: joinTexts(ss.performers || []),
          coordinators: joinTexts(ss.coordinators || []),
          expected_result: ss.expected_result || "",
          due_days: ss.due_days ? `${ss.due_days} ngày` : "",
          forms: uniqForms(ss.forms || []),
          rowSpan: span,
          isFirstRowOfStep: idx === 0,
        });
      });
    }
    return out;
  }, [data]);

  return (
    <ProtectedLayout requiredRole="reporter">
      <div className="p-4 md:p-8 bg-slate-50 min-h-screen">
        <div className="mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              className="bg-transparent"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </div>

          {loading ? (
            <LoadingSpinner size={32} />
          ) : !data ? (
            <Card className="p-6 border-0">
              <p className="text-slate-600">Không tìm thấy quy trình.</p>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="p-6 border-0">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                      {data.name}
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                      Mã: <span className="font-mono">{data.code}</span> •
                      Lần ban hành: {data.version}
                    </p>
                    {data.description ? (
                      <p className="text-sm text-slate-600 mt-2">
                        {data.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Card>

              <Card className="p-0 border-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-white">
                      <tr className="border-b">
                        <th className="p-3 text-left font-semibold w-[60px]">
                          TT
                        </th>
                        <th className="p-3 text-left font-semibold min-w-[220px]">
                          TÊN BƯỚC
                        </th>
                        <th className="p-3 text-left font-semibold min-w-[360px]">
                          NỘI DUNG CÔNG VIỆC
                        </th>
                        <th className="p-3 text-left font-semibold min-w-[180px]">
                          BỘ PHẬN/NGƯỜI THỰC HIỆN
                        </th>
                        <th className="p-3 text-left font-semibold min-w-[180px]">
                          BỘ PHẬN/NGƯỜI PHỐI HỢP
                        </th>
                        <th className="p-3 text-left font-semibold min-w-[200px]">
                          KẾT QUẢ ĐẠT ĐƯỢC
                        </th>
                        <th className="p-3 text-left font-semibold w-[120px]">
                          HẠN
                        </th>
                        <th className="p-3 text-left font-semibold min-w-[180px]">
                          BIỂU MẪU
                        </th>
                      </tr>
                    </thead>

                    <tbody className="bg-slate-50">
                      {rows.map((r, idx) => (
                        <tr
                          key={`${r.step_no}-${r.sub_no}-${idx}`}
                          className="border-b align-top"
                        >
                          {r.isFirstRowOfStep ? (
                            <>
                              <td
                                className="p-3 font-semibold bg-white"
                                rowSpan={r.rowSpan}
                              >
                                {r.step_no}
                              </td>
                              <td className="p-3 bg-white" rowSpan={r.rowSpan}>
                                {r.step_name}
                              </td>
                            </>
                          ) : null}

                          <td className="p-3 whitespace-pre-wrap">
                            {r.work_content}
                          </td>
                          <td className="p-3 whitespace-pre-wrap">
                            {r.performers}
                          </td>
                          <td className="p-3 whitespace-pre-wrap">
                            {r.coordinators}
                          </td>
                          <td className="p-3 whitespace-pre-wrap">
                            {r.expected_result}
                          </td>
                          <td className="p-3">{r.due_days}</td>
                          <td className="p-3">
                            {!r.forms || r.forms.length === 0 ? (
                              <span className="text-slate-400"></span>
                            ) : (
                              <div className="space-y-2">
                                {r.forms.map((f: any) => {
                                  const label = f.form_name || f.form_code;
                                  return (
                                    <div
                                      key={f.id || f.form_code}
                                      className="leading-snug"
                                    >
                                      <div className="font-medium text-slate-900">
                                        {label}
                                      </div>

                                      {f.url_file ? (
                                        <a
                                          href={f.url_file}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-xs text-blue-600 hover:underline"
                                        >
                                          Tải xuống
                                        </a>
                                      ) : (
                                        <div className="text-xs text-slate-400">
                                          Chưa có file
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}

                      {rows.length === 0 ? (
                        <tr>
                          <td className="p-6 text-slate-600" colSpan={8}>
                            Quy trình chưa có bước nào.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
