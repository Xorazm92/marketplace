import React from 'react';

export interface FAQItem {
  id: number;
  question: {
    uz: string;
    ru: string;
    en: string;
  };
  answer: {
    uz: string;
    ru: string;
    en: string;
  };
  category: string;
  order: number;
  is_active: boolean;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  category?: string;
  showSearch?: boolean;
  language?: 'uz' | 'ru' | 'en';
  className?: string;
}

const FAQ: React.FC<FAQProps> = ({
  items,
  title = 'Tez-tez so\'raladigan savollar',
  category,
  showSearch = true,
  language = 'uz',
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [openItems, setOpenItems] = React.useState<Set<number>>(new Set());
  const [filteredItems, setFilteredItems] = React.useState(items);

  // Filter items based on search and category
  React.useEffect(() => {
    let filtered = items.filter(item => item.is_active);

    if (category) {
      filtered = filtered.filter(item => item.category === category);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.question[language].toLowerCase().includes(searchLower) ||
        item.answer[language].toLowerCase().includes(searchLower)
      );
    }

    filtered.sort((a, b) => a.order - b.order);
    setFilteredItems(filtered);
  }, [items, category, searchTerm, language]);

  // Generate Schema.org FAQPage structured data
  const generateFAQStructuredData = () => {
    const faqData = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: filteredItems.map(item => ({
        '@type': 'Question',
        name: item.question[language],
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer[language]
        }
      }))
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    );
  };

  const toggleItem = (id: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  if (filteredItems.length === 0) {
    return null;
  }

  return (
    <>
      {generateFAQStructuredData()}
      
      <section className={`faq-section ${className}`}>
        <div className="faq-container">
          {/* FAQ Header */}
          <div className="faq-header">
            <h2 className="faq-title">{title}</h2>
            
            {/* Search */}
            {showSearch && (
              <div className="faq-search">
                <div className="search-input-wrapper">
                  <svg
                    className="search-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    placeholder={language === 'uz' ? 'Savol qidiring...' : 
                                language === 'ru' ? 'Найти вопрос...' : 'Search questions...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* FAQ Items */}
          <div className="faq-list">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`faq-item ${openItems.has(item.id) ? 'open' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={openItems.has(item.id)}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <span className="question-text">{item.question[language]}</span>
                  <svg
                    className="chevron-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </button>
                
                <div
                  id={`faq-answer-${item.id}`}
                  className="faq-answer"
                  aria-hidden={!openItems.has(item.id)}
                >
                  <div className="answer-content">
                    <p>{item.answer[language]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {searchTerm && filteredItems.length === 0 && (
            <div className="faq-no-results">
              <p>
                {language === 'uz' ? 'Hech qanday savol topilmadi.' :
                 language === 'ru' ? 'Вопросы не найдены.' : 'No questions found.'}
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="clear-search-btn"
              >
                {language === 'uz' ? 'Qidiruvni tozalash' :
                 language === 'ru' ? 'Очистить поиск' : 'Clear search'}
              </button>
            </div>
          )}
        </div>

        <style jsx>{`
          .faq-section {
            padding: 2rem 0;
            background: #ffffff;
          }

          .faq-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 0 1rem;
          }

          .faq-header {
            margin-bottom: 2rem;
            text-align: center;
          }

          .faq-title {
            font-size: 2rem;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 1rem;
          }

          .faq-search {
            margin-top: 1.5rem;
          }

          .search-input-wrapper {
            position: relative;
            max-width: 400px;
            margin: 0 auto;
          }

          .search-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #666;
            pointer-events: none;
          }

          .search-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 3rem;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 1rem;
            background: #ffffff;
            transition: border-color 0.2s ease;
          }

          .search-input:focus {
            outline: none;
            border-color: #ff6b35;
            box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
          }

          .faq-list {
            space-y: 1rem;
          }

          .faq-item {
            border: 1px solid #e1e5e9;
            border-radius: 8px;
            overflow: hidden;
            background: #ffffff;
            margin-bottom: 1rem;
            transition: all 0.2s ease;
          }

          .faq-item:hover {
            border-color: #ff6b35;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .faq-question {
            width: 100%;
            padding: 1.25rem 1.5rem;
            background: none;
            border: none;
            text-align: left;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: background-color 0.2s ease;
          }

          .faq-question:hover {
            background-color: #f8f9fa;
          }

          .faq-item.open .faq-question {
            background-color: #fff5f2;
            border-bottom: 1px solid #e1e5e9;
          }

          .question-text {
            font-size: 1.1rem;
            font-weight: 600;
            color: #1a1a1a;
            flex: 1;
            margin-right: 1rem;
          }

          .chevron-icon {
            color: #666;
            transition: transform 0.2s ease;
            flex-shrink: 0;
          }

          .faq-item.open .chevron-icon {
            transform: rotate(180deg);
          }

          .faq-answer {
            overflow: hidden;
            transition: max-height 0.3s ease;
            max-height: 0;
          }

          .faq-item.open .faq-answer {
            max-height: 500px;
          }

          .answer-content {
            padding: 1.25rem 1.5rem;
            background-color: #f8f9fa;
          }

          .answer-content p {
            margin: 0;
            color: #4a5568;
            line-height: 1.6;
          }

          .faq-no-results {
            text-align: center;
            padding: 3rem 1rem;
            color: #666;
          }

          .clear-search-btn {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background-color: #ff6b35;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background-color 0.2s ease;
          }

          .clear-search-btn:hover {
            background-color: #e55a2b;
          }

          @media (max-width: 768px) {
            .faq-title {
              font-size: 1.5rem;
            }

            .faq-question {
              padding: 1rem;
            }

            .answer-content {
              padding: 1rem;
            }

            .question-text {
              font-size: 1rem;
            }
          }
        `}</style>
      </section>
    </>
  );
};

export default FAQ;