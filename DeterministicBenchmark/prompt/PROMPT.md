The task is to create diverse UIs and paired tasks, that can be used by computer use agents as evaluation environment.

UI concepts
```
INTERACTION PRIMITIVES
	input operations
		text entry
			single line, multi-line, formatted (rich text)
			with validation, auto-complete, suggestions
		value selection
			single choice (radio, dropdown, toggle)
			multiple choice (checkboxes, multi-select)
			range/continuous (sliders, number steppers)
		temporal input
			date picking, time selection, duration ranges
		file operations
			upload (drag-drop, browse), download, preview
	
	selection operations
		item selection
			single item, multiple items, range selection
			with keyboard shortcuts, bulk operations
		hierarchical selection
			tree navigation, nested categories
			breadcrumb following, path traversal
		spatial selection
			map regions, chart data points, image areas
			drawing/annotation tools
	
	navigation operations
		linear navigation
			pagination, scrolling, step-by-step flows
		hierarchical navigation
			menu drilling, tab switching, accordion expansion
		search-driven navigation
			query formulation, filter application, result browsing
		contextual navigation
			popup opening/closing, sidebar toggling, modal management
	
	state manipulation
		content modification
			inline editing, drag-and-drop reordering
			copy/paste, undo/redo operations
		view manipulation
			sorting, filtering, grouping, view switching
		layout manipulation
			resizing panels, repositioning elements
			responsive behavior adaptation
	
	information extraction
		structured data reading
			table scanning, list processing, form review
		visual data interpretation
			chart reading, graph analysis, timeline parsing
			map interpretation, diagram understanding
		status monitoring
			progress tracking, error identification
			notification processing, alert acknowledgment

PRESENTATION CONTEXTS
	container layouts
		single panel, split panes, tabbed interfaces
		sidebar layouts, dashboard grids
		responsive/adaptive layouts
	
	overlay systems
		modals, popovers, tooltips
		context menus, dropdown panels
		full-screen overlays
	
	data displays
		tables (simple, editable, sortable, filterable)
		grids (uniform cards, masonry, responsive)
		lists (simple, hierarchical, virtualized)
		charts (bar, line, pie, scatter, network)
		maps (geographic, conceptual, organizational)
		timelines (linear, branching, interactive)
	
	form structures
		single-step forms, multi-step wizards
		conditional fields, dependent inputs
		validation feedback, error handling

COMPLEXITY FACTORS
	interaction dependencies
		field interdependencies, conditional visibility
		cascade updates, real-time synchronization
	
	cognitive load
		multi-step workflows, context switching
		information synthesis across views
		temporal reasoning (deadlines, sequences)
	
	error conditions
		network failures, validation errors
		permission restrictions, data conflicts
		recovery procedures, alternative paths
	
	performance constraints
		loading states, progressive disclosure
		lazy loading, virtual scrolling
		optimistic updates, conflict resolution
```


Example UIs and tasks
```
| UI Pattern Focus | Simplified Single-Page Task (Max 20 Steps) | UI Concepts |
|------------------|---------------------------------------------|-------------|
| Complex profile forms, connection requests, messaging | Profile editing page: Add 3 new skills via autocomplete, update current job title, change profile photo, set experience visibility to public, save changes | Multi-line text entry, auto-complete suggestions, file upload, toggle switches, form validation |
| Real-time messaging, channel management, file sharing | Channel creation modal: Create channel named "Q1-Planning", set to private, invite 5 team members from dropdown, upload project brief PDF, post welcome message | Text entry, privacy toggles, multiple item selection, file upload (drag-drop), modal management |
| Kanban drag-and-drop, card management, list organization | Board management: Create 3 lists ("To Do", "In Progress", "Done"), add 5 cards to "To Do", drag 2 cards to "In Progress", assign members to each card | Inline text creation, drag-and-drop reordering, member assignment dropdowns, spatial manipulation |
| CRM data entry, opportunity tracking, dashboard customization | Lead creation form: Fill contact details, select industry from dropdown, set lead score (1-100), choose lead source, assign to sales rep, mark as qualified | Multi-field forms, dropdown selection, range sliders, radio buttons, status toggles |
| Repository navigation, pull requests, issue tracking | Issue creation: Write issue title, select labels from checklist, assign to milestone, choose priority level, attach screenshot, submit issue | Text entry, multiple choice checkboxes, dropdown selection, file upload, priority selection |
| Issue creation, workflow states, advanced filtering | Story creation: Enter story title, set story points (fibonacci), select epic from dropdown, add 3 acceptance criteria, assign to developer, set sprint | Text entry, numerical steppers, hierarchical dropdown, multi-line lists, team assignment |
| Real-time design collaboration, commenting, version control | Component creation: Draw rectangle, set fill color via color picker, add text layer, group elements, add to component library, share link | Drawing tools, color picker, text formatting, grouping operations, sharing controls |
| Nested content creation, database views, templates | Database setup: Create task database, add 4 custom properties (Status, Priority, Due Date, Assignee), create 3 sample entries, configure list view | Property configuration, data entry, view switching, custom field types |
| Database/spreadsheet hybrid, filtering, relationship linking | Product inventory: Add 5 products with name/price/quantity, create supplier lookup field, set filters for "In Stock" items, sort by price | Spreadsheet data entry, lookup field creation, filtering controls, sorting options |
| Meeting scheduling, participant management, recording settings | Meeting setup: Schedule meeting for next week, set 90-minute duration, enable waiting room, allow recording, add 8 participants via email | Date/time picker, duration slider, toggle switches, participant entry field |
| Document workflow, signature placement, approval routing | Signature setup: Upload PDF, place 3 signature fields at marked locations, set signing order (1,2,3), add completion deadline, send for signing | File upload, spatial field placement, sequential ordering, date picker |
| Workflow automation, board templates, time tracking | Project board: Add 5 tasks, set status column (Not Started/Working/Done), assign dates, add time tracking, color-code by priority | Task entry, status dropdown, date picker, time logging, color coding |
| Bank reconciliation, expense claims, tax reporting | Expense entry: Add 5 expense transactions, categorize each (Travel/Meals/Office), attach receipt images, set tax rates, submit for approval | Transaction entry, category dropdown, file upload, tax rate selection |
| Conversation management, saved replies, reporting | Conversation handling: Reply to 3 customer emails using saved templates, add tags to each, assign to team members, mark as resolved | Template selection, tag entry, team assignment, status updates |
| Sales pipeline setup, activity tracking, deal forecasting | Deal entry: Create 3 deals with different values, set probability percentages, assign to pipeline stages, schedule follow-up activities | Deal creation, percentage sliders, stage selection, activity scheduling |
| Template customization, brand kit setup, team collaboration | Social post design: Choose Instagram template, replace text, upload brand logo, change background color, resize for Facebook, download | Template selection, text editing, image upload, color picker, format conversion |
| Form logic creation, response analysis, integration setup | Survey builder: Add welcome screen, create 5 questions (text/choice/rating), set logic jumps, configure thank you page, publish form | Question type selection, logic branching, page configuration, publishing controls |
| Multi-app workflow creation, trigger setup, error handling | Workflow setup: Connect Gmail to Slack, set trigger for "new email", map sender to Slack channel, test with sample data, activate automation | App selection, trigger configuration, field mapping, test execution |
```

The goal is to generate diverse environments that would benchmark computer use agents.

Stage 1. 
- randomly choose a combination of specific UI elements and concepts

Stage 2. 
- generate the UI description and task description

Stage 3. 
- describe the data model of the UI
- initial state and desired end state; this will be used to validate task success

Stage 4. 
- generate react app
- use components to generate this UI
- for coding use React
- implement a "Task Description" text area at the top, where you describe in natural language the task
- implement a "Validate" button with class .validate, next to the task description area, at the top;
clicking the validate button will revean a Validation Result area that says which tests fail, and give an overall pass/fail

Stage 5.
- ensure the Validate button is after the Task Description area, and its response is displayed next to the button
- it should respond pass or fail based on the desired final state
- validation should not happen live, unless requested, normally it is done when we click the Validate button
- At the top of every evaluation UI, implement a white rounded container with shadow containing a "Task Instructions" heading followed by a colored instruction box (using any theme color like blue, green, purple, etc. with matching border-left accent). Inside this box, include a bold "Goal:" statement describing the overall objective, followed by numbered steps (1-7 typically) that detail specific actions the agent must complete. Below the instruction box, add a horizontal flex container with a "Validate" button (using the .validate class and matching theme colors) and a conditional validation result display area. The validation result should only appear after clicking the button and display either "PASS" in green styling or "FAIL: [specific failure descriptions]" in red styling. The validation logic should check for exact completion of all specified steps including item creation, property assignment, state changes, filter applications, and UI interactions, providing detailed failure messages for each unmet requirement. This validation section should be clearly separated from the main UI components below it with appropriate spacing and visual hierarchy.

Stage 6.
- in the LLM chat window (not in artifact), report the descriptions of the UI, task, initial state and desired final state

Restrictions:
- no file uploads
- no tab switching
- no drag & drop/sliders
- the task should complete in max 20 actions
- task description, validation button and validation output should be at the top before the actual UI
- the generated tsx file should export a symbol called "App"