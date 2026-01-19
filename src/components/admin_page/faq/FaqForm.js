// src/components/admin/faq/FaqForm.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './FaqForm.module.css';
import { API_BASE_URL } from '../../../config/config';

export default function FaqForm({ id, initialData, onSave, onCancel }) {
  const [question, setQuestion] = useState('');
  const editorRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация данных
  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || '');
    } else {
      setQuestion('');
    }
  }, [initialData]);

  // Установка начального HTML один раз
  // Установка начального HTML один раз
  useEffect(() => {
    if (editorRef.current && !isInitialized) {
      const initialHtml = initialData?.answer || '<p>Введите ответ здесь...</p>';
      editorRef.current.innerHTML = initialHtml;
      setIsInitialized(true);
      editorRef.current.focus();
    }
  }, [initialData, isInitialized]);

  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const insertLink = () => {
    const url = prompt('Введите URL:', 'https://');
    if (url) {
      execFormat('createLink', url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert('Введите вопрос');
      return;
    }

    const answer = editorRef.current?.innerHTML || '<p></p>';

    onSave({
      id: id === 'new' ? Date.now().toString() : id,
      question: question.trim(),
      answer: answer.trim() === '<p><br></p>' ? '<p></p>' : answer,
    });
  };

  return (
    <div className={styles.formCard}>
      <h2>{id === 'new' ? 'Новый вопрос' : 'Редактировать вопрос'}</h2>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label>Вопрос *</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Какова минимальная площадь заказа?"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Ответ *</label>

          {/* Панель инструментов */}
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

          {/* Редактор */}
          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            suppressContentEditableWarning
            spellCheck={false}

            // Главная магия — правильная обработка Enter и Backspace в списках
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;

                const range = selection.getRangeAt(0);
                const li = range.commonAncestorContainer;
                const currentLi = li.nodeType === 3 ? li.parentNode : li;
                const isInList = currentLi.closest && currentLi.closest('li');

                if (isInList) {
                  // Если внутри <li> и текст пустой — выходим из списка
                  if (currentLi.textContent.trim() === '' && currentLi.innerHTML === '<br>') {
                    e.preventDefault();
                    document.execCommand('insertHTML', false, '<br>');
                    document.execCommand('outdent', false, null);
                    return;
                  }

                  // Разрешаем нормальное поведение Enter в списке (новый <li>)
                  return;
                }
              }

              // Запрещаем Shift+Enter (чтобы не было <br> внутри <li>)
              if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
              }
            }}

            // При Backspace — если в начале <li> и пусто — выходим из списка
            onKeyUp={(e) => {
              if (e.key === 'Backspace') {
                const selection = window.getSelection();
                if (!selection.rangeCount) return;
                const range = selection.getRangeAt(0);
                if (!range.collapsed) return;

                const container = range.startContainer;
                const li = container.nodeType === 3 ? container.parentNode : container;
                const currentLi = li.closest('li');

                if (
                  currentLi &&
                  range.startOffset === 0 &&
                  currentLi.textContent.trim() === ''
                ) {
                  e.preventDefault();
                  document.execCommand('outdent', false, null);
                }
              }
            }}
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.saveBtn}>
            {id === 'new' ? 'Создать' : 'Сохранить'}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}