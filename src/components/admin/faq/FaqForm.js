// src/components/admin/faq/FaqForm.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './FaqForm.module.css';

const EMPTY_FAQ = { id: '', question: '', answer: '<p>Введите ответ здесь...</p>' };

export default function FaqForm({ id, initialData, onSave, onCancel }) {
  const [question, setQuestion] = useState('');
  const [htmlAnswer, setHtmlAnswer] = useState('');
  const editorRef = useRef(null);

  // Инициализация
  useEffect(() => {
    if (initialData) {
      setQuestion(initialData.question || '');
      setHtmlAnswer(initialData.answer || '<p></p>');
    } else {
      setQuestion('');
      setHtmlAnswer('<p>Введите ответ здесь...</p>');
    }
  }, [initialData]);

  // Фокус на редактор при открытии
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleAnswerInput = () => {
    if (editorRef.current) {
      setHtmlAnswer(editorRef.current.innerHTML);
    }
  };

  const insertTag = (tag) => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    const wrapper = document.createElement(tag);
    wrapper.textContent = selectedText || 'Текст';

    range.deleteContents();
    range.insertNode(wrapper);

    // Перемещаем курсор внутрь
    const newRange = document.createRange();
    newRange.setStart(wrapper.firstChild, wrapper.textContent.length);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    handleAnswerInput();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.trim()) {
      alert('Введите вопрос');
      return;
    }

    const finalAnswer = htmlAnswer.trim() === '<p><br></p>' || htmlAnswer.trim() === ''
      ? '<p></p>'
      : htmlAnswer;

    const payload = {
      id: id === 'new' ? Date.now().toString() : id,
      question: question.trim(),
      answer: finalAnswer,
    };

    onSave(payload);
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
            onChange={handleQuestionChange}
            placeholder="Какова минимальная площадь заказа?"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Ответ *</label>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <button type="button" onClick={() => document.execCommand('bold', false, null)}>
              <strong>B</strong>
            </button>
            <button type="button" onClick={() => document.execCommand('italic', false, null)}>
              <em>I</em>
            </button>
            <button type="button" onClick={() => document.execCommand('insertUnorderedList', false, null)}>
              •
            </button>
            <button
              type="button"
              onClick={() => {
                const url = prompt('Введите URL:');
                if (url) document.execCommand('createLink', false, url);
              }}
            >
              🔗
            </button>
            <div className={styles.spacer}></div>
            <button type="button" onClick={() => insertTag('strong')} title="Выделить жирным">
              Жирный
            </button>
            <button type="button" onClick={() => insertTag('em')} title="Курсив">
              Курсив
            </button>
          </div>

          {/* ContentEditable Editor */}
          <div
            ref={editorRef}
            className={styles.editor}
            contentEditable
            dangerouslySetInnerHTML={{ __html: htmlAnswer }}
            onInput={handleAnswerInput}
            spellCheck={false}
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