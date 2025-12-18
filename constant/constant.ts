export const STATUS_LABEL: Record<string, string> = {
  new: "Mới",
  assigned: "Đã giao",
  resolved: "Đã giải quyết",
  rejected: "Đã từ chối",
  open: "Mới",
}

export const PRIORITY_LABEL: Record<string, string> = {
  critical: "Khẩn cấp",
  high: "Cao",
  medium: "Trung bình",
  low: "Thâp",
}
export const getStatusLabel = (status: string | string) => {
  return STATUS_LABEL[status as string] ?? status
}

export const getPriorityLabel = (priority: string | string) => {
  return PRIORITY_LABEL[priority as string] ?? priority
}

export const PROCESS_TLTS_MIN = `
QUY TRÌNH: THANH LÝ TÀI SẢN (QT_TLTS)

B1 — Đơn vị quản lý tài sản lập giấy đề nghị
- Nội dung công việc: - Đơn vị trực tiếp quản lý, sử dụng xác định không có nhu cầu sử dụng tài sản hoặc có tần suất sử dụng thấp, khai thác không hiệu quả,…
- Chủ trì: Trưởng đơn vị có tài sản/nhu cầu
- Phối hợp: P.TCHC-QT
- Kết quả: Giấy đề nghị
- Thời hạn: -
- Biểu mẫu: Giấy đề nghị điều chuyển tài sản (Link:https://felcrznxwilqhirhrvzw.supabase.co/storage/v1/object/public/in/Giaydenghithanhlytaisan.docx )

B2 — Tổng hợp danh sách tài sản cần thanh lý
- Nội dung công việc: Trưởng phòng TCHC-QT kiểm tra, đối chiếu hồ sơ và xác định tài sản theo yêu cầu của đơn vị.
- Chủ trì: Trưởng P.TCHC-QT
- Phối hợp: P.Tài chính + đơn vị liên quan
- Kết quả: Giấy đề nghị đã xem xét
- Thời hạn: 3 ngày
- Biểu mẫu: -

B3 — Kiểm tra, đánh giá hiện trạng
- Nội dung công việc: Kiểm tra xác nhận tình trạng, kiến nghị hướng xử lý đúng theo quy định tài chính.
- Chủ trì: Trưởng P.Tài chính (TC)
- Phối hợp: Trưởng P.TCHC-QT
- Kết quả: Biên bản hiện trạng
- Thời hạn: 2 ngày
- Biểu mẫu: Biên bản kiểm tra hiện trạng (Link:https://felcrznxwilqhirhrvzw.supabase.co/storage/v1/object/public/in/Bienbankiemtrahientrang.docx )

B4 — Xét duyệt yêu cầu, danh mục đề xuất (có nhiều bước con)
- 4.1 Rà soát niên hạn/đánh giá -> Biên bản thanh lý
- 4.2 Tổng hợp đề xuất/căn cứ kiểm kê-hiện trạng -> Danh mục thu hồi
- 4.3 Lập danh mục TS cần thu hồi (CĐ)
- 4.4 Lập danh mục CCDC, VTVL cần thu hồi
- 4.5 Lập kế hoạch thanh lý
- 4.6 Tham mưu thành lập Hội đồng TLTS
B5 — Duyệt
- Nội dung công việc: Phê duyệt, hiệu trưởng Hiệu trưởng phân công đơn vị thực hiện quá trình thanh lý tài sản
- Chủ trì: Hiệu trưởng
- Phối hợp: Trưởng các đơn vị, Trưởng phòng chức năng có liên quan
- Kết quả: Phiếu đề xuất (đã được phê duyệt)
- Thời hạn: 1 ngày
- Biểu mẫu: -

B6 — Thẩm định giá tài sản
- Nội dung công việc: Đánh giá tài sản, đề xuất giá trị còn lại làm cơ sở thực hiện hình thức Đấu giá bán tài sản
- Chủ trì: Đơn vị được thuê thực hiện
- Phối hợp: Trưởng P.TCHC-QT
- Kết quả: -
- Thời hạn: -
- Biểu mẫu: -

B7 — Đấu giá bán tài sản
- Nội dung công việc: Sau khi đề xuất được phê duyệt, Phòng TCHC-QT tổ chức thanh lý bán thanh lý tài sản.
- Chủ trì: Trưởng phòng TCHC-QT/ Người được phân công thực hiện
- Phối hợp: Trưởng đơn vị có liên quan phối hợp thực hiện
- Kết quả: Biên bản thanh lý tài sản
- Thời hạn: 5 ngày
- Biểu mẫu: -

B8 — Cập nhật biến động tài sản, vị trí đặt để của tài sản vào p/m QLTS
- Nội dung công việc: Các hồ sơ được lập theo biểu mẫu và lưu tại P.TCHC-QT, P.Tài chính, đơn vị có liên quan, Cập nhật biến động tài sản sàn trên phần mềm QLTS
- Chủ trì: Phòng tài chính
- Phối hợp: -
- Kết quả: Tài sản đã được cập nhật biến động
- Thời hạn: 2 ngày
- Biểu mẫu: -
`

export const PROCESS_KKTS_MIN = `
QUY TRÌNH: KIỂM KÊ TÀI SẢN (QT_KKTS)

B1 — Tổng hợp số liệu tài sản tăng, giảm, điều chuyển, thanh lý
- Nội dung công việc: Tổng hợp số liệu tài sản tăng, giảm, điều chuyển, thanh lý trong năm; lập danh sách tài sản điều chuyển hoặc thay đổi tình trạng sử dụng; lập danh sách tài sản tăng, giảm gửi về Phòng TCHC-QT.
- Chủ trì: Phòng TCHC-QT, Phòng Tài chính, Đơn vị sử dụng tài sản
- Phối hợp: Các Phòng, Trung tâm, Khoa chuyên môn
- Kết quả: Hồ sơ kiểm kê
- Thời hạn: 2 ngày
- Biểu mẫu: Kế hoạch kiểm kê tài sản (Link:https://felcrznxwilqhirhrvzw.supabase.co/storage/v1/object/public/in/Kehoachkiemketaisan.docx )

B2 — Lập kế hoạch kiểm kê tài sản
- Nội dung công việc: Lập kế hoạch kiểm kê; trình phê duyệt Hội đồng kiểm kê; lập chương trình làm việc; dự toán kinh phí; hướng dẫn các đơn vị tự kiểm kê nội bộ; trình hồ sơ cho Hiệu trưởng xét duyệt.
- Chủ trì: Phòng TCHC-QT
- Phối hợp: Các Phòng, Trung tâm, Khoa chuyên môn
- Kết quả: Quyết định thành lập Ban kiểm kê; Mã số tài sản
- Thời hạn: 2 ngày
- Biểu mẫu: Kế hoạch kiểm kê tài sản

B3 — Phê duyệt kế hoạch kiểm kê
- Nội dung công việc: Phê duyệt kế hoạch để triển khai kiểm kê tại các đơn vị; trường hợp không phê duyệt thì rà soát, đánh giá lại nội dung kế hoạch kiểm kê.
- Chủ trì: Hiệu trưởng
- Phối hợp: Hội đồng kiểm kê; Các Phòng, Trung tâm, Khoa chuyên môn
- Kết quả: Quyết định thành lập Ban kiểm kê; Mã số tài sản
- Thời hạn: 1 ngày
- Biểu mẫu: -

B4 — Tiến hành kiểm kê theo kế hoạch
- Nội dung công việc: Kiểm kê thực tế tại các đơn vị; đối chiếu tài sản thực tế với sổ sách; đánh giá chất lượng còn lại của tài sản theo biên bản kiểm kê năm trước.
- Chủ trì: Hội đồng kiểm kê
- Phối hợp: Trưởng các đơn vị trực thuộc
- Kết quả: Kế hoạch kiểm kê tại thời điểm 0h ngày 31/12
- Thời hạn: 7 ngày
- Biểu mẫu: Biên bản kiểm kê tài sản (Link:https://felcrznxwilqhirhrvzw.supabase.co/storage/v1/object/public/in/Bienbankiemketaisan.docx )

B5 — Phê duyệt biến động tài sản, vị trí đặt để tài sản
- Nội dung công việc: Báo cáo trình Hội đồng kiểm kê phê duyệt hồ sơ kiểm kê; trường hợp chưa phù hợp thì điều chỉnh để phê duyệt.
- Chủ trì: Hội đồng kiểm kê
- Phối hợp: -
- Kết quả: Biên bản kiểm kê tài sản
- Thời hạn: 7 ngày
- Biểu mẫu: -

B6 — Báo cáo, lưu hồ sơ
- Nội dung công việc: Báo cáo tổng kết công tác kiểm kê; lập bảng tổng hợp tài sản tăng, giảm; lập biên bản kiểm kê; xử lý dữ liệu, điều chỉnh và cập nhật.
- Chủ trì: Hội đồng kiểm kê
- Phối hợp: -
- Kết quả: Bảng báo cáo; Bảng tổng hợp tài sản; Biên bản kiểm kê
- Thời hạn: 2 ngày
- Biểu mẫu: -
`

export const PROCESS_THTS_MIN = `
QUY TRÌNH: THU HỒI TÀI SẢN (QT_THTS)

B1 — Đơn vị quản lý tài sản lập giấy đề nghị
- Nội dung công việc: Đơn vị trực tiếp quản lý, sử dụng xác định tài sản không còn nhu cầu sử dụng hoặc sử dụng không hiệu quả; chủ động lập giấy đề nghị thu hồi tài sản.
- Chủ trì: Trưởng đơn vị có yêu cầu
- Phối hợp: Phòng TCHC-QT
- Kết quả: Giấy đề nghị
- Thời hạn: -
- Biểu mẫu: Giấy đề nghị thu hồi tài sản (Link:https://felcrznxwilqhirhrvzw.supabase.co/storage/v1/object/public/in/Giaydenghithuhoitaisan.docx )

B2 — Tiếp nhận yêu cầu
- Nội dung công việc: Trưởng phòng TCHC-QT kiểm tra, đối chiếu hồ sơ đề nghị; không đồng ý thì phản hồi đơn vị; đồng ý thì tham mưu BGH phụ trách cơ sở phê duyệt.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính và các đơn vị có liên quan
- Kết quả: Giấy đề nghị (đã được xem xét)
- Thời hạn: 3 ngày
- Biểu mẫu: -

B3 — Kiểm tra, đánh giá hiện trạng
- Nội dung công việc: Kiểm tra xác nhận tình trạng tài sản, kiến nghị hướng xử lý đúng quy định tài chính; đánh giá, rà soát quá trình sử dụng đúng niên hạn theo quy định.
- Chủ trì: Trưởng phòng Tài chính
- Phối hợp: Trưởng phòng TCHC-QT
- Kết quả: Biên bản hiện trạng; Biên bản thu hồi tài sản
- Thời hạn: 2 ngày
- Biểu mẫu: 
  + Biên bản kiểm tra hiện trạng (Link:https://felcrznxwilqhirhrvzw.supabase.co/storage/v1/object/public/in/Bienbankiemtrahientrang.docx )
  + Biên bản thu hồi tài sản (Link:https://felcrznxwilqhirhrvzw.supabase.co/storage/v1/object/public/in/Bienbanthuhoitaisan.docx )

B4 — Tổng hợp lập danh sách tài sản cần thu hồi
- Nội dung công việc: Tiếp nhận các đề xuất; căn cứ biên bản kiểm kê, biên bản hiện trạng; tổng hợp danh mục tài sản hư hỏng, không thể sửa chữa hoặc không còn nhu cầu sử dụng cần thu hồi.
- Chủ trì: Trưởng phòng Tài chính
- Phối hợp: Trưởng phòng TCHC-QT; Đơn vị có tài sản cần thu hồi
- Kết quả: Danh mục tài sản cần thu hồi
- Thời hạn: 2 ngày
- Biểu mẫu: -

B5 — Xét duyệt yêu cầu
- Nội dung công việc: Phê duyệt yêu cầu thu hồi; phân công đơn vị/cá nhân thực hiện; trường hợp không phê duyệt thì nêu rõ lý do và trả lại đơn vị tiếp nhận.
- Chủ trì: Ban Giám hiệu phụ trách cơ sở
- Phối hợp: Trưởng các đơn vị; Trưởng phòng chức năng có liên quan
- Kết quả: Phiếu đề xuất (đã được phê duyệt)
- Thời hạn: 2 ngày
- Biểu mẫu: -

B6 — Duyệt
- Nội dung công việc: Phê duyệt hoặc không phê duyệt yêu cầu thu hồi tài sản; trường hợp không phê duyệt thì nêu rõ lý do và trả lại đơn vị tiếp nhận.
- Chủ trì: Hiệu trưởng
- Phối hợp: Trưởng các đơn vị; Trưởng phòng chức năng có liên quan
- Kết quả: Phiếu đề xuất (đã được phê duyệt)
- Thời hạn: 1 ngày
- Biểu mẫu: -

B7 — Thu hồi tài sản lưu kho
- Nội dung công việc: Sau khi đề xuất được phê duyệt, Phòng TCHC-QT tổ chức thu hồi tài sản và đưa về kho lưu trữ.
- Chủ trì: Trưởng phòng TCHC-QT / Người được phân công thực hiện
- Phối hợp: Trưởng đơn vị có liên quan phối hợp thực hiện
- Kết quả: Biên bản thu hồi tài sản
- Thời hạn: 5 ngày
- Biểu mẫu: Biên bản thu hồi tài sản

B8 — Cập nhật biến động tài sản, vị trí đặt để của tài sản vào p/m QLTS
- Nội dung công việc: Lập và lưu hồ sơ theo biểu mẫu tại P.TCHC-QT, P.Tài chính và đơn vị liên quan; cập nhật biến động tài sản trên phần mềm QLTS theo quy định.
- Chủ trì: Phòng Tài chính
- Phối hợp: Trưởng phòng chức năng có liên quan
- Kết quả: Tài sản được cập nhật biến động trên phần mềm QLTS
- Thời hạn: 1–2 ngày
- Biểu mẫu: -
`

export const PROCESS_CSVCKT_MIN = `
QUY TRÌNH: XÂY DỰNG/SỬA CHỮA/CẢI TẠO/NÂNG CẤP/MỞ RỘNG CSVC (QT_CSVCKT)

B1 — Đơn vị lập giấy đề nghị
- Nội dung công việc: Lập Giấy đề nghị theo kế hoạch/nhiệm vụ được giao hoặc phát sinh đột xuất, gửi Phòng TCHC-QT tổng hợp tham mưu.
- Chủ trì: Trưởng đơn vị có yêu cầu
- Phối hợp: Phòng TCHC-QT
- Kết quả: Giấy đề nghị
- Thời hạn: -
- Biểu mẫu: M.01/QT.01/CĐĐN-TCHCQT (Chưa có file)

B2 — Tiếp nhận yêu cầu, đánh giá tình trạng
- Nội dung công việc: Tiếp nhận giấy đề nghị; chuyển các phòng chức năng xem xét/đánh giá; phối hợp lập biên bản hiện trạng, đề xuất hướng khắc phục; trình Hiệu trưởng phê duyệt.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính và các đơn vị có liên quan
- Kết quả: Giấy đề nghị (đã được xem xét)
- Thời hạn: 3 ngày
- Biểu mẫu: -

B3 — Kiểm tra, đánh giá hiện trạng
- Nội dung công việc: Kiểm tra xác nhận tình trạng, đề xuất hướng xử lý đúng theo quy định tài chính.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng TC; Đơn vị sửa chữa; Đơn vị có tài sản hư hỏng
- Kết quả: Biên bản hiện trạng
- Thời hạn: 2 ngày
- Biểu mẫu: M.02/QT.01/CĐĐN-TCHCQT (Chưa có file)

B4 — Xét duyệt yêu cầu
- Nội dung công việc: Phê duyệt và phân công đơn vị/cá nhân hoặc thuê đơn vị ngoài thực hiện; nếu không phê duyệt thì nêu rõ lý do và trả lại đơn vị tiếp nhận.
- Chủ trì: Hiệu trưởng
- Phối hợp: Trưởng phòng TCHC-QT; Trưởng phòng chức năng có liên quan
- Kết quả: Phiếu trình; Ý kiến phê duyệt trên phiếu trình
- Thời hạn: 3 ngày
- Biểu mẫu: Phiếu trình (thuộc Quy trình thanh toán) (Chưa có file)

B5 — Lập dự toán, kế hoạch lựa chọn nhà thầu, hồ sơ dự thầu sửa chữa (có nhiều bước con)
- 5.1 Hư hỏng nhỏ/đơn giản: lập khối lượng + dự trù vật tư (3 ngày) — BM: M.03/QT.01/CĐĐN-TCHCQT
- 5.2 Hư hỏng phức tạp: mời đơn vị ngoài lập báo giá/dự toán
- 5.3 Kiểm tra khối lượng so với dự trù (1 ngày) — KQ: Duyệt khối lượng
- 5.4 Kiểm tra đơn giá theo công bố/thị trường (1 ngày)
- 5.5 < 50 triệu: mời ≥03 đơn vị ngoài báo giá (5 ngày)
- 5.6 < 50 triệu: chọn báo giá thấp nhất (2 ngày) — KQ: Duyệt giá — BM: M.04/QT.01/CĐĐN-TCHCQT
- 5.7 50–<300 triệu: thuê tư vấn lập hồ sơ thiết kế–dự toán (7 ngày)
- 5.8 50–<300 triệu: thuê tư vấn lập hồ sơ BCKTKT (7 ngày)
- 5.9 50–<300 triệu: thu thập báo giá hạng mục (7 ngày)
- 5.10 Thẩm tra: thuê tư vấn/tổ thẩm tra hồ sơ (5 ngày) — KQ: HS thiết kế–dự toán đóng dấu thẩm tra

B6 — Phê duyệt dự toán, kế hoạch, mở thầu sửa chữa (có nhiều bước con)
- 6.1 Trình BGH thẩm định HS thiết kế–dự toán/BCKTKT/báo giá (1 ngày) — KQ: QĐ phê duyệt BCKTKT/HS thiết kế–dự toán — BM: M.05/QT.01/CĐĐN-TCHCQT
- 6.2 Lập KHLCNT và đăng tải lên Hệ thống mạng đấu thầu QG (7 ngày) — KQ: QĐ phê duyệt KHLCNT
- 6.3 Mời ≥03 đơn vị ngoài báo giá thi công xây lắp (7 ngày) — KQ: Báo giá dự thầu
- 6.4 Mời đơn vị được chọn đến thương thảo HĐ (1 ngày) — KQ: HĐ được thương thảo
- 6.5 Mời đơn vị được chọn ký HĐ (1 ngày) — KQ: Dự thảo HĐ được ký kết
- 6.6 Hoàn tất hồ sơ trình BGH phê duyệt (1 ngày) — KQ: Báo giá + BB xét thầu + QĐ chọn thầu + HĐ dịch vụ

B7 — Ký hợp đồng
- Nội dung công việc: BGH đồng ý duyệt hồ sơ thì ký kết hợp đồng thi công; không đồng ý thì trả lại đơn vị trình hồ sơ.
- Chủ trì: Hiệu trưởng
- Phối hợp: Trưởng phòng TCHC-QT; Trưởng phòng Tài chính
- Kết quả: Hợp đồng dịch vụ được ký kết
- Thời hạn: 1 ngày
- Biểu mẫu: -

B8 — Tổ chức thực hiện công tác (có 2 bước con)
- 8.1 Tổ chức sửa chữa/thay thế (2 ngày) — KQ: Biên bản nghiệm thu, bàn giao vật tư — BM: M.04/QT.01/CĐĐN-TCHCQT
- 8.2 Tổ chức giám sát thi công (10 ngày) — KQ: Phiếu Bảo dưỡng, sửa chữa kiểm tra — BM: M.08/QT.01/CĐĐN-TCHCQT

B9 — Nghiệm thu hoàn thành
- Nội dung công việc: Sau khi hoàn thành công việc, căn cứ Phiếu Bảo dưỡng/sửa chữa kiểm tra để lập hồ sơ nghiệm thu khối lượng.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính; Đơn vị có yêu cầu sửa chữa
- Kết quả: Biên bản nghiệm thu công tác sửa chữa, bảo dưỡng
- Thời hạn: 2 ngày
- Biểu mẫu: -

B10 — Nghiệm thu quyết toán, thanh lý hợp đồng
- Nội dung công việc: Thanh lý hợp đồng trình Ban giám hiệu phê duyệt.
- Chủ trì: Phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính
- Kết quả: Thanh lý hợp đồng
- Thời hạn: 1 ngày
- Biểu mẫu: -

B11 — Lưu hồ sơ, báo cáo tài sản
- Nội dung công việc: Báo cáo ghi tăng/giảm giá trị tài sản theo quy định; lưu hồ sơ tại Phòng TCHC-QT theo thời gian lưu trữ pháp luật.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính
- Kết quả: Hồ sơ lưu + báo cáo tài sản
- Thời hạn: 1 ngày
- Biểu mẫu: -

B12 — Bàn giao tài sản
- Nội dung công việc: Lập biên bản giao/nhận tài sản cho đơn vị yêu cầu sửa chữa và lưu hồ sơ.
- Chủ trì: P.TCHC-QT
- Phối hợp: Trưởng phòng Tài chính; Đơn vị có yêu cầu sửa chữa
- Kết quả: Biên bản bàn giao tài sản; Lưu hồ sơ
- Thời hạn: 1 ngày
- Biểu mẫu: M.11/QT.01/CĐĐN-TCHCQT (Chưa có file)

B13 — Đưa tài sản vào sử dụng
- Nội dung công việc: Ghi sổ quản lý tài sản tại đơn vị nhận tài sản sau sửa chữa.
- Chủ trì: Trưởng đơn vị có yêu cầu sửa chữa
- Phối hợp: Trưởng phòng TCHC-QT
- Kết quả: Sổ nhật ký quản lý tài sản
- Thời hạn: -
- Biểu mẫu: -
`

export const PROCESS_MSHHDV_MIN = `
QUY TRÌNH: MUA SẮM HÀNG HÓA VÀ DỊCH VỤ (QT_MSHHDV)

B1 — Xác định nhu cầu mua sắm hàng hóa
- Nội dung công việc: Căn cứ dự toán/kế hoạch và phân giao kinh phí; xác định nhu cầu mua sắm theo CTĐT/kế hoạch giảng dạy và số lượng thực tế.
  + a) Phôi liệu, vật tư, vật liệu tiêu hao: lập các bảng định mức và giấy đề xuất mua.
  + b) Hàng hóa/dịch vụ phi tư vấn: lập danh mục, dự toán chi tiết; gửi kèm tối thiểu 01 báo giá.
- Chủ trì: Trưởng đơn vị có yêu cầu
- Phối hợp: Phòng TCHC-QT
- Kết quả: Hồ sơ yêu cầu mua sắm
- Thời hạn: -
- Biểu mẫu: 
  + M.01/QT.02/CĐĐN-TCHC-QT
  + M.02/QT.02/CĐĐN-TCHC-QT
  + M.03/QT.02/CĐĐN-TCHC-QT
  + M.04/QT.02/CĐĐN-TCHC-QT
  + M.05/QT.02/CĐĐN-TCHC-QT (Chưa có file)

B2 — Tiếp nhận yêu cầu, tổng hợp
- Nội dung công việc: Kiểm tra tính hợp lý, đối chiếu số lượng theo CTĐT; yêu cầu chỉnh sửa nếu chưa phù hợp.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính và các đơn vị liên quan
- Kết quả: Giấy đề xuất mua hàng hóa/dịch vụ phi tư vấn
- Thời hạn: 3 ngày
- Biểu mẫu: -

B3 — Lập dự toán mua sắm
- Nội dung công việc: Căn cứ tối thiểu 01 báo giá (hoặc giá trung bình ≥02 báo giá) để lập dự toán mua sắm.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính; Đơn vị cung cấp uy tín
- Kết quả: Bảng dự toán hàng hóa
- Thời hạn: 2 ngày
- Biểu mẫu: M.06/QT.02/CĐĐN-TCHC-QT (Chưa có file)

B4 — Thẩm định dự toán
- Nội dung công việc: Trình BGH thẩm định và phê duyệt dự toán.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: -
- Kết quả: Báo cáo thẩm định dự toán
- Thời hạn: 2 ngày
- Biểu mẫu: -

B5 — Phê duyệt dự toán
- Nội dung công việc: Phê duyệt hoặc không phê duyệt dự toán; nêu rõ lý do nếu không phê duyệt.
- Chủ trì: Hiệu trưởng
- Phối hợp: Trưởng phòng TCHC-QT; Trưởng phòng chức năng liên quan
- Kết quả: Phiếu trình; Ý kiến phê duyệt
- Thời hạn: 3 ngày
- Biểu mẫu: Phiếu trình (thuộc Quy trình thanh toán) (Chưa có file)

B6 — Lập KHLCNT (có nhiều bước con theo ngưỡng giá trị)
- 6.1 < 10 triệu: Lấy 01 báo giá; chọn đơn vị cung cấp (5–<10 triệu phải có hợp đồng).
- 6.2 10–<50 triệu: Lấy ≥03 báo giá; lập biên bản xét chọn giá thấp nhất.
- 6.3 50–<300 triệu: Lập KHLCNT; thẩm định, phê duyệt; lấy ≥03 báo giá; lập hồ sơ trình duyệt KQLCNT.
- 6.4 ≥300 triệu: Thành lập Tổ chuyên gia/Tổ thẩm định; lập, thẩm định, phê duyệt E-HSMT/HSYC; đăng tải, mở thầu, đánh giá HSDT/HSDX; trình và phê duyệt KQLCNT.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính; Tổ chuyên gia; Tổ thẩm định; Đơn vị tư vấn (nếu có)
- Kết quả: Quyết định phê duyệt Kế hoạch lựa chọn nhà thầu
- Thời hạn: 3–15 ngày (tùy ngưỡng)
- Biểu mẫu: Biên bản xét chọn giá; QĐ phê duyệt KHLCNT (tham chiếu Quy trình CSVC)

B7 — Phê duyệt KQLCNT / mở thầu mua sắm
- Nội dung công việc: Trình BGH phê duyệt KQLCNT; đăng tải kết quả trong 05 ngày kể từ ngày phê duyệt.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Tổ chuyên gia; Tổ thẩm định; Ban Giám hiệu
- Kết quả: Quyết định phê duyệt kết quả lựa chọn nhà thầu
- Thời hạn: 5 ngày
- Biểu mẫu: Quyết định phê duyệt KQLCNT (Chưa có file)

B8 — Ký hợp đồng
- Nội dung công việc: Đồng ý duyệt hồ sơ thì ký kết hợp đồng; không đồng ý thì trả lại đơn vị trình hồ sơ.
- Chủ trì: Hiệu trưởng
- Phối hợp: Trưởng phòng TCHC-QT; Trưởng phòng Tài chính
- Kết quả: Hợp đồng dịch vụ được ký kết
- Thời hạn: 1 ngày
- Biểu mẫu: -

B9 — Tổ chức mua sắm hàng hóa
- Nội dung công việc: Tổ chức mua sắm theo hợp đồng/kết quả lựa chọn nhà thầu.
- Chủ trì: Người được phân công / Đơn vị cung cấp
- Phối hợp: Trưởng phòng TCHC-QT; Đơn vị đề xuất
- Kết quả: Biên bản nghiệm thu, bàn giao vật tư
- Thời hạn: 2 ngày
- Biểu mẫu: -

B10 — Nghiệm thu bàn giao hàng hóa
- Nội dung công việc: Lập hồ sơ nghiệm thu khối lượng/bàn giao hàng hóa.
- Chủ trì: Trưởng phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính; Đơn vị có yêu cầu
- Kết quả: Biên bản nghiệm thu
- Thời hạn: 2 ngày
- Biểu mẫu: M.08/QT.02/CĐĐN-TCHC-QT (Chưa có file)

B11 — Nghiệm thu quyết toán
- Nội dung công việc: Thanh lý hợp đồng trình Ban Giám hiệu phê duyệt.
- Chủ trì: Phòng TCHC-QT
- Phối hợp: Trưởng phòng Tài chính
- Kết quả: Thanh lý hợp đồng
- Thời hạn: 1 ngày
- Biểu mẫu: -

B12 — Lưu hồ sơ, theo dõi quản lý phôi liệu, CCDC, in mã QLTS
- Nội dung công việc: Báo cáo tăng/giảm tài sản; lưu hồ sơ; nhập dữ liệu và in mã QLTS CD.
- Chủ trì: Trưởng phòng Tài chính
- Phối hợp: Trưởng phòng TCHC-QT
- Kết quả: Bộ chứng từ thanh toán; In mã QLTS CD
- Thời hạn: 1 ngày
- Biểu mẫu: M.09/QT.02/CĐĐN-TCHC-QT (Chưa có file)

B13 — Biên bản kiểm kê phôi liệu, công cụ, dụng cụ, dán mã QLTS CD
- Nội dung công việc: Lập biên bản giao/nhận phôi liệu, CCDC cho đơn vị; dán mã QLTS CD.
- Chủ trì: P.TCHC-QT
- Phối hợp: Trưởng phòng Tài chính; Đơn vị có yêu cầu
- Kết quả: Biên bản bàn giao; Dán mã QLTS CD
- Thời hạn: 1 ngày
- Biểu mẫu: M.10/QT.02/CĐĐN-TCHC-QT (Chưa có file)

B14 — Đưa hàng hóa vào sử dụng (có 2 bước con)
- 14a Phôi liệu, vật tư tiêu hao: Bàn giao cho GV/HSSV ký nhận; theo dõi, thống kê tiêu hao; ghi sổ quản lý.
- 14b Hàng hóa/dịch vụ phi tư vấn: Bàn giao cho đơn vị sử dụng, ghi sổ nhật ký quản lý.
- Chủ trì: P.TCHC-QT / Trưởng đơn vị có yêu cầu
- Phối hợp: Khoa chuyên môn; Phòng Tài chính; GV/HSSV
- Kết quả: Sổ theo dõi/nhật ký sử dụng phôi liệu, tài sản
- Thời hạn: -
- Biểu mẫu: -
`



