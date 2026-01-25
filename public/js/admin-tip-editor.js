(() => {
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('/admin/uploads/tip-image', { method: 'POST', body: formData });
    const data = await res.json();
    return data.location || data.url;
  };

  const insertImageHtml = (url) => `<img src="${url}" style="display:block;margin:0.8em auto;max-width:100%;height:auto;" />`;

  const insertIntoTextarea = (textarea, html) => {
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = `${before}${html}${after}`;
    const newPos = start + html.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
  };

  const bindAddMedia = () => {
    const addMediaBtn = document.getElementById('add-media');
    if (!addMediaBtn) return;
    addMediaBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = true;
      input.onchange = () => {
        const files = Array.from(input.files || []).filter(f => f.type.startsWith('image/'));
        if (!files.length) return;
        const editor = window.tinymce ? tinymce.get('editor') : null;
        const textarea = document.getElementById('editor');
        files.forEach(async (file) => {
          try {
            const url = await uploadImage(file);
            const html = insertImageHtml(url);
            if (editor) {
              editor.focus();
              editor.insertContent(html);
            } else {
              insertIntoTextarea(textarea, html);
            }
          } catch (err) {
            alert('Upload ảnh thất bại');
          }
        });
      };
      input.click();
    });
  };

  const bindTextareaMedia = () => {
    const textarea = document.getElementById('editor');
    if (!textarea) return;

    const handleFiles = (files) => {
      const images = Array.from(files || []).filter(f => f.type.startsWith('image/'));
      if (!images.length) return;
      images.forEach(async (file) => {
        try {
          const url = await uploadImage(file);
          insertIntoTextarea(textarea, insertImageHtml(url));
        } catch (err) {
          alert('Upload ảnh thất bại');
        }
      });
    };

    textarea.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    textarea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (!dt?.files?.length) return;
      e.preventDefault();
      handleFiles(dt.files);
    });
    textarea.addEventListener('paste', (e) => {
      const files = e.clipboardData?.files;
      if (!files?.length) return;
      e.preventDefault();
      handleFiles(files);
    });
  };

  const initTinyMCE = () => {
    if (!window.tinymce) return;

    const initEditor = () => tinymce.init({
      selector: '#editor',
      height: 520,
      menubar: false,
      plugins: 'lists link image table code preview media autoresize',
      toolbar: 'undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image media | table | code preview',
      skin: 'oxide-dark',
      content_css: 'dark',
      automatic_uploads: true,
      images_upload_url: '/admin/uploads/tip-image',
      images_upload_credentials: true,
      images_reuse_filename: true,
      paste_data_images: false,
      file_picker_types: 'image',
      file_picker_callback: (callback) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = () => {
          const file = input.files[0];
          if (!file) return;
          uploadImage(file)
            .then(url => callback(url))
            .catch(() => alert('Upload ảnh thất bại'));
        };
        input.click();
      },
      setup: (editor) => {
        editor.on('init', () => {
          if (editor.mode?.set) {
            editor.mode.set('design');
          } else if (editor.setMode) {
            editor.setMode('design');
          }
          const doc = editor.getDoc();
          if (!doc) return;
          doc.addEventListener('dragover', (e) => {
            if (e.dataTransfer?.types?.includes('Files')) {
              e.preventDefault();
            }
          });
          doc.addEventListener('drop', (e) => {
            if (e.dataTransfer?.files?.length) {
              e.preventDefault();
            }
          });
        });

        editor.on('drop', async (e) => {
          const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'));
          if (!files.length) return;
          e.preventDefault();
          e.stopPropagation();
          for (const file of files) {
            try {
              const url = await uploadImage(file);
              editor.insertContent(insertImageHtml(url));
            } catch (err) {
              alert('Upload ảnh thất bại');
            }
          }
        });

        editor.on('paste', async (e) => {
          const files = Array.from(e.clipboardData?.files || []).filter(f => f.type.startsWith('image/'));
          if (!files.length) return;
          e.preventDefault();
          e.stopPropagation();
          for (const file of files) {
            try {
              const url = await uploadImage(file);
              editor.insertContent(insertImageHtml(url));
            } catch (err) {
              alert('Upload ảnh thất bại');
            }
          }
        });
      }
    });

    initEditor();

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.dataset.tab;
        const editor = tinymce.get('editor');
        if (!editor) return;
        if (mode === 'text') {
          editor.execCommand('mceCodeEditor');
        } else if (editor.mode?.set) {
          editor.mode.set('design');
        } else if (editor.setMode) {
          editor.setMode('design');
        }
      });
    });
  };

  const preventWindowDrop = () => {
    window.addEventListener('dragover', (e) => {
      if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault();
      }
    });
    window.addEventListener('drop', (e) => {
      if (e.dataTransfer?.files?.length) {
        e.preventDefault();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    bindAddMedia();
    bindTextareaMedia();
    initTinyMCE();
    preventWindowDrop();
  });
})();
