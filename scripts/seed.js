require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const slugifyVN = require('../src/utils/slugify');

const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Tag = require('../src/models/Tag');
const Tip = require('../src/models/Tip');
const Ticket = require('../src/models/Ticket');
const Contact = require('../src/models/Contact');

const { getMongoUri } = require('../src/config/mongoUri');

const MONGODB_URI = getMongoUri() || 'mongodb://localhost:27017/doi-chmt';

const categories = [
  "Windows",
  "Office",
  "Driver",
  "Mạng",
  "Bảo mật",
  "Tăng tốc",
  "Laptop",
  "Phan cung",
  "May in",
  "MacOS",
  "Email"
].map(name => ({ name, slug: slugifyVN(name) }));

const tags = [
  "Tối ưu",
  "Cài đặt",
  "Sửa lỗi",
  "USB",
  "Phần mềm",
  "Update",
  "WiFi",
  "Bảo vệ",
  "Diệt virus",
  "Pin",
  "SSD",
  "Mạng",
  "Registry",
  "Driver",
  "Nhiet do",
  "O cung",
  "Ban phim",
  "May in",
  "Tai khoan",
  "Backup",
  "Cloud",
  "Email"
].map(name => ({ name, slug: slugifyVN(name) }));

const tips = [
  {
    "title": "Cách tăng tốc khởi động Windows 10",
    "excerpt": "Hướng dẫn tắt các chương trình khởi động cùng Windows để máy tính chạy nhanh hơn.",
    "content": "<h2>Tắt chương trình khởi động</h2><p>Mở Task Manager &gt; Startup, tắt các app không cần thiết.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Tối ưu",
      "Cài đặt"
    ],
    "isFeatured": true
  },
  {
    "title": "Sửa lỗi không nhận USB trên Windows",
    "excerpt": "Khắc phục lỗi máy tính không nhận USB bằng Device Manager.",
    "content": "<h2>Kiểm tra Device Manager</h2><p>Uninstall driver USB và restart máy.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Sửa lỗi",
      "USB"
    ],
    "isFeatured": true
  },
  {
    "title": "Cách cài Office 2019 bản quyền",
    "excerpt": "Các bước tải và cài đặt Office 2019 chính hãng.",
    "content": "<h2>Tải Office</h2><p>Truy cập trang Microsoft, tải file ISO và cài đặt.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Office",
    "tags": [
      "Cài đặt",
      "Phần mềm"
    ],
    "isFeatured": true
  },
  {
    "title": "Khắc phục lỗi font chữ trong Word",
    "excerpt": "Sửa lỗi font chữ bị lỗi khi mở file Word.",
    "content": "<h2>Cài font tiếng Việt</h2><p>Tải font Arial, Times New Roman, cài vào Windows.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Office",
    "tags": [
      "Sửa lỗi",
      "Cài đặt"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách cập nhật driver tự động",
    "excerpt": "Sử dụng Windows Update để cập nhật driver mới nhất.",
    "content": "<h2>Windows Update</h2><p>Vào Settings &gt; Update &amp; Security &gt; Check for updates.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Driver",
    "tags": [
      "Update",
      "Cài đặt"
    ],
    "isFeatured": false
  },
  {
    "title": "Sửa lỗi mất mạng trên laptop",
    "excerpt": "Cách reset card mạng khi bị mất kết nối.",
    "content": "<h2>Reset card mạng</h2><p>Vào Device Manager, disable rồi enable lại card mạng.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Mạng",
    "tags": [
      "Sửa lỗi",
      "WiFi"
    ],
    "isFeatured": false
  },
  {
    "title": "Tăng tốc độ WiFi cho máy tính",
    "excerpt": "Một số mẹo giúp WiFi ổn định và nhanh hơn.",
    "content": "<h2>Đặt lại router</h2><p>Khởi động lại router, đặt vị trí gần máy tính.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Mạng",
    "tags": [
      "Tối ưu",
      "WiFi"
    ],
    "isFeatured": false
  },
  {
    "title": "Bảo vệ máy tính khỏi virus",
    "excerpt": "Các bước cơ bản để bảo vệ máy tính khỏi phần mềm độc hại.",
    "content": "<h2>Cài phần mềm diệt virus</h2><p>Dùng Windows Defender hoặc phần mềm uy tín.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Bảo mật",
    "tags": [
      "Bảo vệ",
      "Diệt virus"
    ],
    "isFeatured": true
  },
  {
    "title": "Cách kiểm tra pin laptop",
    "excerpt": "Kiểm tra tình trạng pin bằng lệnh Windows.",
    "content": "<h2>powercfg /batteryreport</h2><p>Mở CMD, nhập lệnh trên để xuất báo cáo pin.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Tăng tốc",
    "tags": [
      "Pin",
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Tối ưu SSD cho Windows 11",
    "excerpt": "Thiết lập tối ưu giúp SSD bền và nhanh hơn.",
    "content": "<h2>Chống phân mảnh</h2><p>Không nên chống phân mảnh SSD, chỉ optimize.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Tăng tốc",
    "tags": [
      "SSD",
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách bật/tắt Windows Defender",
    "excerpt": "Hướng dẫn bật hoặc tắt tạm thời Windows Defender.",
    "content": "<h2>Settings &gt; Update &amp; Security &gt; Windows Security</h2>",
    "thumbnail": "/images/og-default.png",
    "category": "Bảo mật",
    "tags": [
      "Bảo vệ",
      "Cài đặt"
    ],
    "isFeatured": false
  },
  {
    "title": "Sửa lỗi không cài được phần mềm",
    "excerpt": "Khắc phục lỗi khi cài app bị báo lỗi.",
    "content": "<h2>Chạy với quyền admin</h2><p>Chuột phải file setup &gt; Run as administrator.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Sửa lỗi",
      "Phần mềm"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách reset Windows về mặc định",
    "excerpt": "Khôi phục Windows về trạng thái ban đầu.",
    "content": "<h2>Reset this PC</h2><p>Settings &gt; Update &amp; Security &gt; Recovery.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Cài đặt",
      "Sửa lỗi"
    ],
    "isFeatured": false
  },
  {
    "title": "Tăng tốc khởi động Office",
    "excerpt": "Tắt add-in không cần thiết để Office mở nhanh hơn.",
    "content": "<h2>Quản lý Add-in</h2><p>File &gt; Options &gt; Add-ins.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Office",
    "tags": [
      "Tối ưu",
      "Phần mềm"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách update Office tự động",
    "excerpt": "Bật tính năng tự động cập nhật Office.",
    "content": "<h2>Account &gt; Update Options</h2>",
    "thumbnail": "/images/og-default.png",
    "category": "Office",
    "tags": [
      "Update",
      "Cài đặt"
    ],
    "isFeatured": false
  },
  {
    "title": "Sửa lỗi không vào được mạng LAN",
    "excerpt": "Kiểm tra IP, reset TCP/IP.",
    "content": "<h2>Command Prompt</h2><p>ipconfig /release &amp; /renew</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Mạng",
    "tags": [
      "Sửa lỗi",
      "Mạng"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách bật/tắt Bluetooth trên laptop",
    "excerpt": "Hướng dẫn nhanh bật/tắt Bluetooth.",
    "content": "<h2>Settings &gt; Devices &gt; Bluetooth</h2>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Cài đặt",
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Tối ưu Registry để tăng tốc",
    "excerpt": "Một số tweak Registry giúp Windows mượt hơn.",
    "content": "<h2>Registry Editor</h2><p>Chỉnh sửa cẩn thận, backup trước khi làm.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Tăng tốc",
    "tags": [
      "Registry",
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách kiểm tra driver còn thiếu",
    "excerpt": "Dùng Device Manager để kiểm tra driver.",
    "content": "<h2>Device Manager</h2><p>Xem dấu chấm than vàng.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Driver",
    "tags": [
      "Sửa lỗi",
      "Update"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách backup dữ liệu trước khi cài lại Win",
    "excerpt": "Sao lưu dữ liệu quan trọng trước khi cài lại.",
    "content": "<h2>Sao lưu ra USB/HDD</h2>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Cài đặt",
      "USB"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách diệt virus bằng Safe Mode",
    "excerpt": "Khởi động vào Safe Mode để diệt virus hiệu quả.",
    "content": "<h2>Safe Mode</h2><p>F8 khi khởi động máy.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Bảo mật",
    "tags": [
      "Diệt virus",
      "Bảo vệ"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách kiểm tra nhiệt độ CPU",
    "excerpt": "Dùng phần mềm HWMonitor hoặc BIOS.",
    "content": "<h2>HWMonitor</h2><p>Tải và cài đặt HWMonitor.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Tăng tốc",
    "tags": [
      "Tối ưu",
      "Phần mềm"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách cài driver thủ công",
    "excerpt": "Tải driver từ trang chủ và cài đặt.",
    "content": "<h2>Trang chủ hãng</h2><p>Chọn đúng model máy.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Driver",
    "tags": [
      "Cài đặt",
      "Driver"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách kiểm tra bản quyền Windows",
    "excerpt": "Kiểm tra trạng thái bản quyền bằng lệnh CMD.",
    "content": "<h2>slmgr /xpr</h2><p>Mở CMD, nhập lệnh trên.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Cài đặt",
      "Sửa lỗi"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách bật/tắt update Windows",
    "excerpt": "Bật/tắt Windows Update trong Services.",
    "content": "<h2>services.msc</h2><p>Tìm Windows Update, chọn Disable/Enable.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Update",
      "Cài đặt"
    ],
    "isFeatured": false
  },
  {
    "title": "Mẹo giảm nóng CPU khi chơi game",
    "excerpt": "Tối ưu quạt và vệ sinh giúp CPU mát hơn khi tải nặng.",
    "content": "<h2>Vệ sinh tản nhiệt</h2><p>Tháo bụi, thay keo tản nhiệt định kỳ.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Tăng tốc",
    "tags": [
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Sửa lỗi không vào được WiFi sau khi cập nhật",
    "excerpt": "Khắc phục lỗi WiFi mất kết nối sau Windows Update.",
    "content": "<h2>Quên mạng & kết nối lại</h2><p>Settings &gt; Network &gt; WiFi &gt; Manage known networks.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Mạng",
    "tags": [
      "WiFi",
      "Sửa lỗi"
    ],
    "isFeatured": false
  },
  {
    "title": "Tối ưu bộ nhớ ảo cho Windows",
    "excerpt": "Cấu hình Virtual Memory giúp máy mượt hơn khi thiếu RAM.",
    "content": "<h2>System Properties</h2><p>Advanced &gt; Performance &gt; Virtual Memory.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách đổi DNS để vào mạng ổn định",
    "excerpt": "Đổi DNS giúp truy cập nhanh và ổn định hơn.",
    "content": "<h2>Đổi DNS</h2><p>IPv4: 8.8.8.8 / 8.8.4.4 hoặc 1.1.1.1.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Mạng",
    "tags": [
      "Mạng",
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Khắc phục lỗi Word bị treo khi mở file",
    "excerpt": "Tắt add-in và chạy Word ở Safe Mode.",
    "content": "<h2>Safe Mode</h2><p>Win+R &gt; winword /safe.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Office",
    "tags": [
      "Sửa lỗi",
      "Phần mềm"
    ],
    "isFeatured": false
  },
  {
    "title": "Cách kiểm tra ổ đĩa bad sector",
    "excerpt": "Dùng lệnh chkdsk để kiểm tra và sửa lỗi ổ đĩa.",
    "content": "<h2>chkdsk</h2><p>Mở CMD (Admin), chạy: chkdsk /f /r.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Sửa lỗi"
    ],
    "isFeatured": false
  },
  {
    "title": "Bật xác thực 2 lớp cho tài khoản",
    "excerpt": "Tăng bảo mật bằng xác thực hai lớp (2FA).",
    "content": "<h2>2FA</h2><p>Bật 2FA trên email và các dịch vụ quan trọng.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Bảo mật",
    "tags": [
      "Bảo vệ"
    ],
    "isFeatured": false
  },
  {
    "title": "Sửa lỗi bàn phím laptop không gõ được",
    "excerpt": "Kiểm tra driver và layout bàn phím.",
    "content": "<h2>Device Manager</h2><p>Uninstall keyboard driver và restart.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Driver",
    "tags": [
      "Sửa lỗi",
      "Driver"
    ],
    "isFeatured": false
  },
  {
    "title": "Ve sinh laptop dinh ky de may mat hon",
    "excerpt": "Huong dan ve sinh quat, khe tan nhiet giup may mat va ben hon.",
    "content": "<h2>Ve sinh dinh ky</h2><p>Tat may, thao bui quat va khe tan nhiet, thay keo neu can.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Laptop",
    "tags": [
      "Tối ưu",
      "Nhiet do"
    ],
    "isFeatured": true
  },
  {
    "title": "Kiem tra tinh trang o cung bang CrystalDiskInfo",
    "excerpt": "Theo doi suc khoe o cung va canh bao som loi bad sector.",
    "content": "<h2>CrystalDiskInfo</h2><p>Cai phan mem va kiem tra Health Status, nhiet do o cung.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Phan cung",
    "tags": [
      "O cung",
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Sua loi ban phim go sai ky tu",
    "excerpt": "Khac phuc loi ban phim go sai ky tu do layout hoac driver.",
    "content": "<h2>Kiem tra layout</h2><p>Chuyen dung ngon ngu ban phim trong Settings.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Laptop",
    "tags": [
      "Ban phim",
      "Sửa lỗi"
    ],
    "isFeatured": false
  },
  {
    "title": "Cai driver may in tren Windows",
    "excerpt": "Tai va cai dung driver may in de in on dinh.",
    "content": "<h2>Tai driver chinh hang</h2><p>Chon dung model va he dieu hanh tren website hang.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "May in",
    "tags": [
      "Driver",
      "Cài đặt",
      "May in"
    ],
    "isFeatured": false
  },
  {
    "title": "Cach reset mat khau Windows 10",
    "excerpt": "Huong dan dat lai mat khau khi quen tai khoan Windows.",
    "content": "<h2>Local account</h2><p>Dung cau hoi bao mat hoac tao mat khau moi tu Safe Mode.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Tai khoan",
      "Sửa lỗi"
    ],
    "isFeatured": false
  },
  {
    "title": "Bat che do ngu dong (Hibernate) tren Windows",
    "excerpt": "Tiet kiem pin ma van khoi dong nhanh bang Hibernate.",
    "content": "<h2>Power Options</h2><p>Control Panel -> Power Options -> Choose what the power buttons do.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Tối ưu",
      "Cài đặt"
    ],
    "isFeatured": false
  },
  {
    "title": "Toi uu dung luong o C nhanh chong",
    "excerpt": "Don rac, xoa file tam de o C trong hon.",
    "content": "<h2>Disk Cleanup</h2><p>Chay Disk Cleanup va xoa Temporary files trong Settings.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Tối ưu",
      "O cung"
    ],
    "isFeatured": false
  },
  {
    "title": "Backup du lieu len Google Drive",
    "excerpt": "Sao luu thu muc quan trong len Google Drive de tranh mat du lieu.",
    "content": "<h2>Google Drive for Desktop</h2><p>Cai Drive va chon thu muc can dong bo.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Backup",
      "Cloud"
    ],
    "isFeatured": false
  },
  {
    "title": "Sua loi mat am thanh tren Windows 11",
    "excerpt": "Khac phuc loi mat tieng do driver hoac cau hinh sai.",
    "content": "<h2>Sound settings</h2><p>Chon dung output va cap nhat driver am thanh.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Driver",
    "tags": [
      "Sửa lỗi",
      "Driver"
    ],
    "isFeatured": false
  },
  {
    "title": "Tat ung dung chay nen tren Windows 11",
    "excerpt": "Giam tai RAM bang cach tat app chay nen khong can thiet.",
    "content": "<h2>Startup Apps</h2><p>Settings -> Apps -> Startup, tat ung dung khong can thiet.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Windows",
    "tags": [
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Doi DNS tren macOS de truy cap on dinh",
    "excerpt": "Cai thien toc do mang tren macOS bang cach doi DNS.",
    "content": "<h2>System Settings</h2><p>Network -> Wi-Fi -> DNS, nhap 1.1.1.1 hoac 8.8.8.8.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "MacOS",
    "tags": [
      "Mạng",
      "Tối ưu"
    ],
    "isFeatured": false
  },
  {
    "title": "Tao chu ky email chuyen nghiep trong Gmail",
    "excerpt": "Thiet lap chu ky de email trong chuyen nghiep va nhat quan.",
    "content": "<h2>Gmail Settings</h2><p>Settings -> See all settings -> Signature de tao chu ky.</p>",
    "thumbnail": "/images/og-default.png",
    "category": "Email",
    "tags": [
      "Email",
      "Cài đặt"
    ],
    "isFeatured": false
  }
];

const users = [
  {
    name: 'Admin',
    email: 'admin@congthuthuat.vn',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Nguyễn Văn A',
    email: 'user1@congthuthuat.vn',
    password: 'user123',
    role: 'user'
  },
  {
    name: 'Trần Thị B',
    email: 'user2@congthuthuat.vn',
    password: 'user123',
    role: 'user'
  }
];

const tickets = [
  {
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    email: 'user1@congthuthuat.vn',
    deviceType: 'Laptop',
    os: 'Windows 10',
    urgency: 'high',
    location: 'Hà Nội',
    preferredTime: 'Sáng',
    description: 'Máy bị chậm, nghi nhiễm virus.',
    attachmentUrl: '',
    status: 'NEW',
    adminNotes: []
  },
  {
    name: 'Trần Thị B',
    phone: '0987654321',
    email: 'user2@congthuthuat.vn',
    deviceType: 'PC',
    os: 'Windows 11',
    urgency: 'medium',
    location: 'TP.HCM',
    preferredTime: 'Chiều',
    description: 'Không vào được mạng LAN.',
    attachmentUrl: '',
    status: 'ACCEPTED',
    adminNotes: [{ note: 'Đã liên hệ khách, hướng dẫn reset card mạng.' }]
  },
  {
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    email: 'user1@congthuthuat.vn',
    deviceType: 'Laptop',
    os: 'Windows 10',
    urgency: 'low',
    location: 'Hà Nội',
    preferredTime: 'Tối',
    description: 'Cần cài lại Office.',
    attachmentUrl: '',
    status: 'IN_PROGRESS',
    adminNotes: [{ note: 'Đang chuẩn bị file cài.' }]
  },
  {
    name: 'Trần Thị B',
    phone: '0987654321',
    email: 'user2@congthuthuat.vn',
    deviceType: 'PC',
    os: 'Windows 11',
    urgency: 'high',
    location: 'TP.HCM',
    preferredTime: 'Sáng',
    description: 'Máy không nhận USB.',
    attachmentUrl: '',
    status: 'DONE',
    adminNotes: [{ note: 'Đã xử lý xong, khách hài lòng.' }]
  },
  {
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    email: 'user1@congthuthuat.vn',
    deviceType: 'Laptop',
    os: 'Windows 10',
    urgency: 'medium',
    location: 'Hà Nội',
    preferredTime: 'Chiều',
    description: 'Cần kiểm tra pin laptop.',
    attachmentUrl: '',
    status: 'REJECTED',
    adminNotes: [{ note: 'Khách tự xử lý được.' }]
  },
  {
    name: 'Trần Thị B',
    phone: '0987654321',
    email: 'user2@congthuthuat.vn',
    deviceType: 'PC',
    os: 'Windows 11',
    urgency: 'low',
    location: 'TP.HCM',
    preferredTime: 'Tối',
    description: 'Cần tối ưu SSD.',
    attachmentUrl: '',
    status: 'NEW',
    adminNotes: []
  },
  {
    name: 'Nguyễn Văn A',
    phone: '0912345678',
    email: 'user1@congthuthuat.vn',
    deviceType: 'Laptop',
    os: 'Windows 10',
    urgency: 'medium',
    location: 'Hà Nội',
    preferredTime: 'Sáng',
    description: 'Cần backup dữ liệu.',
    attachmentUrl: '',
    status: 'ACCEPTED',
    adminNotes: []
  },
  {
    name: 'Trần Thị B',
    phone: '0987654321',
    email: 'user2@congthuthuat.vn',
    deviceType: 'PC',
    os: 'Windows 11',
    urgency: 'high',
    location: 'TP.HCM',
    preferredTime: 'Chiều',
    description: 'Cần kiểm tra driver.',
    attachmentUrl: '',
    status: 'IN_PROGRESS',
    adminNotes: []
  }
];

const contacts = [
  {
    name: 'Pham Minh K',
    email: 'minhk@example.com',
    message: 'Can tu van ve viec nang cap RAM cho laptop.'
  },
  {
    name: 'Le Thi H',
    email: 'lethih@example.com',
    message: 'Xin bao gia ve sinh may va thay keo tan nhiet.'
  },
  {
    name: 'Nguyen Duc T',
    email: 'ndt@example.com',
    message: 'Muon ho tro cap nhat driver may in.'
  }
];

async function seed() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany();
  await Category.deleteMany();
  await Tag.deleteMany();
  await Tip.deleteMany();
  await Ticket.deleteMany();
  await Contact.deleteMany();

  // Users
  for (const u of users) {
    u.passwordHash = await bcrypt.hash(u.password, 10);
    delete u.password;
    await User.create(u);
  }
  // Categories
  const catDocs = await Category.insertMany(categories);
  // Tags
  const tagDocs = await Tag.insertMany(tags);

  // Tips
  for (const t of tips) {
    const cat = catDocs.find(c => c.name === t.category);
    const tagArr = tagDocs.filter(tag => t.tags.includes(tag.name)).map(tag => tag._id);
    await Tip.create({
      title: t.title,
      slug: slugifyVN(t.title),
      excerpt: t.excerpt,
      content: t.content,
      thumbnail: t.thumbnail,
      category: cat._id,
      tags: tagArr,
      status: 'published',
      isFeatured: t.isFeatured,
      views: Math.floor(Math.random() * 200 + 10)
    });
  }

  // Tickets
  const userDocs = await User.find();
  for (let i = 0; i < tickets.length; i++) {
    const t = tickets[i];
    const user = userDocs.find(u => u.email === t.email);
    await Ticket.create({
      ...t,
      user: user._id
    });
  }

  // Contacts
  for (const c of contacts) {
    await Contact.create(c);
  }

  console.log('Seed thành công!');
  process.exit();
}

seed();
