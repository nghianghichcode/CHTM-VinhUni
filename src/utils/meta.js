// Dynamic meta for SEO
function getMeta({ title, description, url, image }) {
  return {
    title: title || 'Thủ Thuật & Cứu Hộ Máy Tính',
    description: description || 'Cổng thông tin chia sẻ thủ thuật, cứu hộ máy tính, hỗ trợ Windows, Office, mạng, bảo mật, tăng tốc, sửa lỗi.',
    url: url || process.env.BASE_URL,
    image: image || `${process.env.BASE_URL}/images/og-default.png`
  };
}

module.exports = { getMeta };
