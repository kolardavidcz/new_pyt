/**
 * @file types.js
 * @description Comprehensive JSDoc type definitions for Python Hub data models and state.
 */

/**
 * @typedef {Object} CourseItem
 * @property {string} id - Unique item identifier (e.g., "l01-intro", "ex01-basics")
 * @property {string} title - Human-readable title of lecture or exercise set
 * @property {'lecture'|'exercise'} type - Type of curriculum item
 * @property {string} path - Relative URL path to content JSON or HTML file
 * @property {number} relevance - Relevance score (1-10) for filtering
 * @property {number} [rel] - Alias for relevance score
 * @property {string} [flavor] - Difficulty flavor ("basics", "resyntax", "newconcept", "pythonic", "paradigm")
 * @property {string[]} [tags] - Educational tags ("Core", "WOW", "Legendary", "Tricky", "Skip")
 * @property {string} [weekId] - Parent week identifier
 */

/**
 * @typedef {Object} CourseWeek
 * @property {string} id - Week identifier (e.g., "w01", "w02")
 * @property {string} title - Week title (e.g., "Týden 1 — Úvod do jazyka Python")
 * @property {string} description - Brief summary of week topics
 * @property {CourseItem[]} items - Array of lecture and exercise items for the week
 */

/**
 * @typedef {Object} CourseManifest
 * @property {string} title - Course title
 * @property {string} version - Curriculum version
 * @property {CourseWeek[]} weeks - Array of weekly topics
 */

/**
 * @typedef {Object} ExerciseTask
 * @property {number} num - Task number within exercise set
 * @property {string} title - Task title
 * @property {number} techScore - Technical complexity score (T1-T5)
 * @property {number} logicScore - Logical complexity score (L1-L5)
 * @property {string} promptHtml - Formatted HTML prompt / assignment text
 * @property {string} [hintHtml] - Formatted HTML hint (Nápověda)
 * @property {string} [solutionHtml] - Formatted HTML solution (Řešení)
 */

/**
 * @typedef {Object} AppUser
 * @property {string} username - User login handle (e.g. "kolard")
 * @property {string} name - Full display name
 * @property {string} studentId - Student identifier number
 * @property {string} faculty - Faculty affiliation (e.g. "FCHI · VSČHT Praha")
 */

/**
 * @typedef {Object} EditorTab
 * @property {string} id - Tab identifier
 * @property {'welcome'|'lecture'|'exercise'|'progress'|'checklist'|'slides'} kind - Content view type
 * @property {string} title - Tab label
 * @property {string} [itemId] - Associated course item ID
 * @property {string} [weekId] - Associated week ID
 * @property {number} [pageId] - Associated presentation slide index
 */

/**
 * @typedef {Object} AppFilters
 * @property {string} text - Active search query
 * @property {Set<string>} tags - Active tag filters
 * @property {Set<string>} flavors - Active flavor filters
 * @property {number} relMin - Minimum relevance score (1-10)
 * @property {string} sort - Sort order ("course" | "relevance" | "alphabetical")
 */

/**
 * @typedef {Object} AppState
 * @property {CourseManifest|null} course - Loaded curriculum manifest
 * @property {Record<string, any>} slides - Extracted lecture slide sections
 * @property {Record<string, any>} pagesIndex - Outline index for presentation mode
 * @property {Record<string, ExerciseTask[]>} exercises - Structured exercise tasks by path
 * @property {CourseItem[]} items - Flat array of all course items
 * @property {Map<string, CourseWeek>} weeksById - Week map indexed by week ID
 * @property {Map<string, CourseItem>} itemsById - Item map indexed by item ID
 * @property {AppFilters} filters - Search and filtering state
 * @property {'explorer'|'search'|'progress'} view - Active sidebar panel
 * @property {boolean} sidebarOpen - Sidebar visibility toggle
 * @property {number} sidebarWidth - Sidebar pixel width
 * @property {'dark'|'light'} codeBlockColor - Code block theme setting for printing
 * @property {EditorTab[]} tabs - Open editor tabs
 * @property {string|null} activeTabId - Currently active tab ID
 * @property {Map<string, boolean>} expanded - Sidebar tree expansion state
 * @property {Set<string>} seen - Auto-seen item IDs
 * @property {Set<string>} studied - Manually studied item IDs (primary metric)
 * @property {Set<string>} checklist - Checked items in 4-level checklist
 * @property {string|null} focusedTreeKey - Focused sidebar tree node key
 * @property {AppUser|null} user - Active user profile
 */

export {};
