// src/components/admin/faq/FaqForm.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './FaqForm.module.css';


export default function FaqForm({ mode, id, initialData, onClose, authToken, adminApiUrl }) {
  const [question, setQuestion] = useState('');
  const editorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация полей
  useEffect(() => {
    console.log(initialData);
    setQuestion(initialData?.question || '');
    setIsInitialized(false);
  }, [initialData]);

  // Инициализация редактора и фокус
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      const initialHtml = initialData?.answer || '<p>Введите ответ здесь...</p>';
      editorRef.current.innerHTML = initialHtml;
      setIsInitialized(true);
      // Фокус после установки HTML
      setTimeout(() => {
        editorRef.current?.focus();
      }, 0);
    }
  }, [initialData, isInitialized]);

  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Введите URL:', 'https://');
    if (url) execFormat('createLink', url);
  };

  const getAnswerHtml = () => {
    return editorRef.current?.innerHTML || '<p></p>';
  };

  // --- Обработчики действий ---
  const handleApprove = async (edited = false) => {
    const answer = getAnswerHtml();
    const payload = { answer };

    try {
      const res = await fetch(`${adminApiUrl}/${id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to approve');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Ошибка при одобрении');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Вы уверены, что хотите отклонить этот вопрос?')) return;
    try {
      const res = await fetch(`${adminApiUrl}/${id}/reject`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error('Failed to reject');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Ошибка при отклонении');
    }
  };

  const handleSave = async () => {
    const q = question.trim();
    if (!q) {
      alert('Введите вопрос');
      return;
    }
    const answer = getAnswerHtml();

    try {
      if (mode === 'edit' && id === 'new') {
        const res = await fetch(adminApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            question: q,
            answer,
            creatorName: "ADMINISTRATION",
            creatorEmail: "maks@mail.ru",
          }),
        });
        if (!res.ok) throw new Error('Failed to create');
      } else if (mode === 'edit') {
        const res = await fetch(`${adminApiUrl}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ id, question: q, answer }),
        });
        if (!res.ok) throw new Error('Failed to update');
      }
      onClose();
    } catch (err) {
      console.error(err);
      alert('Ошибка сохранения');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'moderation') {
      handleApprove(false);
    } else {
      handleSave();
    }
  };

  return (
    <div className={styles.formCard}>
      {/* Крестик закрытия */}
      <button type="button" className={styles.closeButton} onClick={onClose}>
        ×
      </button>

      <h2>
        {mode === 'moderation'
          ? 'Модерация вопроса'
          : id === 'new'
            ? 'Новый вопрос'
            : 'Редактировать вопрос'}
      </h2>

      {/* Информация об авторе (только в режиме модерации) */}
      {/* Информация об авторе — для редактирования и модерации */}
      {initialData && id !== 'new' && (
        <div className={styles.authorInfo}>
          Автор: {initialData.creatorName?.trim() ? initialData.creatorName : '—'},&nbsp;
          Email: {initialData.creatorEmail?.trim() ? initialData.creatorEmail : '—'}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Вопрос *</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Какова минимальная площадь заказа?"
            required
            disabled={mode === 'moderation'}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Ответ *</label>
          <div className={styles.toolbar}>
            <button type="button" onClick={() => execFormat('bold')} title="Жирный">
              <strong>B</strong>
            </button>
            <button type="button" onClick={() => execFormat('italic')} title="Курсив">
              <em>I</em>
            </button>
            <button type="button" onClick={() => execFormat('insertUnorderedList')} title="Маркированный список">
              List
            </button>
            <button type="button" onClick={insertLink} title="Вставить ссылку">
              Link
            </button>
          </div>

          {/* Редактор с tabIndex для фокуса */}
          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            tabIndex={0} // ← позволяет получать фокус
            suppressContentEditableWarning
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                const range = selection.getRangeAt(0);
                const li = range.commonAncestorContainer;
                const currentLi = li.nodeType === 3 ? li.parentNode : li;
                const isInList = currentLi.closest && currentLi.closest('li');
                if (isInList) {
                  if (currentLi.textContent.trim() === '' && currentLi.innerHTML === '<br>') {
                    e.preventDefault();
                    document.execCommand('insertHTML', false, '<br>');
                    document.execCommand('outdent', false, null);
                    return;
                  }
                  return;
                }
              }
              if (e.key === 'Enter' && e.shiftKey) e.preventDefault();
            }}
            onKeyUp={(e) => {
              if (e.key === 'Backspace') {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                const range = selection.getRangeAt(0);
                if (!range.collapsed) return;
                const container = range.startContainer;
                const li = container.nodeType === 3 ? container.parentNode : container;
                const currentLi = li.closest('li');
                if (currentLi && range.startOffset === 0 && currentLi.textContent.trim() === '') {
                  e.preventDefault();
                  document.execCommand('outdent', false, null);
                }
              }
            }}
          />
        </div>

        <div className={styles.actions}>
          {mode === 'moderation' ? (
            <>
              <button type="button" className={styles.rejectBtn} onClick={handleReject}>
                ❌ Отклонить
              </button>
              <button
                type="button"
                className={styles.approveBtn}
                onClick={() => handleApprove(false)}
              >
                ✅ Одобрить как есть
              </button>
              <button
                type="button"
                className={styles.saveBtn}
                onClick={() => handleApprove(true)}
              >
                💾 Сохранить и одобрить
              </button>
            </>
          ) : (
            <>
              <button type="submit" className={styles.saveBtn}>
                {id === 'new' ? 'Создать' : 'Сохранить'}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Отмена
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}