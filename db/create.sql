-- phpMyAdmin SQL Dump
-- version 5.1.3
-- https://www.phpmyadmin.net/
--
-- Host: 7097_db2
-- Generation Time: Apr 23, 2022 at 03:24 PM
-- Server version: 10.7.3-MariaDB-1:10.7.3+maria~focal
-- PHP Version: 8.0.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `faq`
--
CREATE DATABASE IF NOT EXISTS `faq` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `faq`;

-- --------------------------------------------------------

--
-- Table structure for table `answers`
--

CREATE TABLE `answers` (
  `id` int(10) UNSIGNED NOT NULL,
  `question_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `body` text NOT NULL,
  `location_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `answers`
--

INSERT INTO `answers` (`id`, `question_id`, `user_id`, `created`, `body`, `location_id`) VALUES
(1, 1, 3, '2022-04-22 18:40:51', 'I would probably redirect your question to [Stackoverflow!](https://stackoverflow.com)', NULL),
(5, 2, 3, '2022-04-22 20:43:58', '### My Answer \n*for what it\'s worth*\n\nI think you can do something like this:\n\n```html\n<input name=\"mytext\" multiline=\"true\" />\n```', NULL),
(13, 3, 1, '2022-04-22 21:23:11', '## Feature 1 ✓\n\n| Requirement | Status | Notes |\n|---|---|---|\n| What users can see | ✓ | Users can post questions if logged it<br> But not if logged out |\n| Question deets | 👍🏻 | Title, summary, markdown, image;<br>all there! |\n| Meta | 💰 | username and date (not time) below each q&a |', NULL),
(17, 2, 1, '2022-04-22 21:34:46', '# FaqTextarea\n\nWell in this app, we\'ve used a custom HTML Element to wrap a `<pre contenteditable>` and bind its content to a hidden input. \n\nThe problem is that `<textarea>` is extremely difficult make pretty. So `contenteditable` is a nice alternatave.\nHere\'s a snippet:\n\n### The Javascript element:\n```typescript\n\nexport default class FaqTextarea extends HTMLElement {\n\n    get maxlength() {\n        return +(this.getAttribute(\'maxlength\') ?? Number.POSITIVE_INFINITY)\n    }\n\n    private get input() {\n        return nonNil(this.querySelector(\'input\'))\n    }\n\n    private get textbox() {\n        return nonNil(this.querySelector(\'pre\'))\n    }\n\n    /**\n     * Sets the initial content when connected to the dom\n     */\n    connectedCallback() {\n        const { innerHTML: value } = this\n        this.innerHTML = \'\'\n        logger.info(value)\n        this.buildContent(value).catch(logger.error)\n    }\n\n    clear() {\n        this.textbox.innerHTML = this.input.value = \'\'\n    }\n\n    private async buildContent(value: string): Promise<void> {\n        // a lot of magic here\n\n    }\n}\n\ncustomElements.define(\'faq-textarea\', FaqTextarea)\n\n```\n\n### The HTML Template file [faq-textarea.tpl](/js/elements/faq-textarea.tpl)\n\n```html\n<label for=\"{{name}}\">{{label}}\n    <input name=\"{{name}}\" type=\"hidden\"/>\n</label>\n<pre role=\"textarea\" contenteditable></pre>\n\n```\n\n### Usage\n```html\n<faq-textarea maxlength=\"200\" required>\n    # Here is some markdown\n\n   \'\'\'javascript\n     alert(\'bnga\') // That\'s bang out of order\n   \'\'\'\n</faq-textarea>\n```', NULL),
(18, 3, 2, '2022-04-22 21:51:10', '## Feature 2 ✓\n\n| Requirement | Status |\n|---|---|---|\n| Questions on home screen | ✓ |\n| The title | 👌|\n| The short multi-line summary. | 🙌🏼|\n| The username of the person asking the question. |✔ |\n| The date (but not the time) when the question was posted. | 😁|\n\n**ALL PRESENT AND CORRECT**', NULL),
(19, 3, 2, '2022-04-22 21:55:51', '## Feature 3 ✓\r\n\r\n       If the user clicks on one of the titles on the homepage \r\n       they should be taken to a Details page which includes \r\n       the following features:\r\n\r\n| Requirement | Status |\r\n|---|---|---|\r\n| Questions on home screen | ✓ |\r\n| The title | 👌|\r\n| The short multi-line summary. | 🙌🏼|\r\n| Detailed markdown | 🥳 |\r\n| Image (of provided )| ✅ |\r\n| The username of the person asking the question. |✔ |\r\n| The date (but not the time) when the question was posted. | 😁|\r\n\r\n**ALL PRESENT AND CORRECT**', NULL),
(20, 3, 2, '2022-04-22 21:59:38', '## Feature 4 ✓\n\n| Requirement | Status |\n|---|---|---|\n| Questions on home screen | ✓ |\n| Can answer only other users’ questions | ✔ |\n| Answers stored with username & date   | ✔ |\n| Can answer only other users’ questions | ✔ |\n| Previous questions (with meta & markdown) between Question and New Answer box | ✔ |', NULL),
(21, 3, 2, '2022-04-22 22:06:41', '## Feature 5 🌦\r\n\r\n| Requirement | Status | Comments |\r\n|---|---|---|\r\n| The question author can mark questions as correct | ❌ | If this had been implemented, then the app would be more like Stackoverflow<br>and \'DnSO\' would be a better joke! ¯\\\\_(ツ)_/¯ |\r\n| The answer status displayed on homepage | ✅| Even a resolve status will show up <br>(although it’d have to manually inputted into the database) |\r\n| Keywords | ❌ | Well the data relationships exist but not the functionality<br>You can however search by question title on the homepage. |\r\n\r\nAnd that’s it really. No more extras.', NULL),
(22, 2, 3, '2022-04-22 22:17:38', '.. I\'m not sure it was the best way but I found it interesting :D', NULL),
(23, 1, 3, '2022-04-22 22:23:58', 'OK so the way we achieved this was to re-build the server as part of the test case:\n\n# Running the server\n\n```typescript\n\nexport default function serve() {\n\n    mockDb() // This is to avoid needing a live database; to allow headless testing\n\n    const app = new Application()\n\n    app.use(onRequest) // This is our mockable middleware. The rest is just our app\n\n    app.use(errorHandler)\n    app.use(setHeaders)\n    app.use(checkContentType)\n    app.use(checkCredentials)\n    app.use(staticFiles)\n    app.use(router.routes() as Middleware)\n    app.use(router.allowedMethods() as Middleware)\n\n    return promise = new Promise<void>((resolve, reject) => {\n        app.addEventListener(\'listen\', ({ port }) => {\n            logger.info(`MOCK APU listening on port: ${port}`)\n            resolve()\n        })\n        app.listen({ port })\n            .catch(logger.error)\n            .finally(() => {\n                reject()\n                logger.info(\'Mock server stopped\')\n                promise = undefined\n            })\n    })\n}\n```\n\n#Browser Ctrl\n```typescript\nawait serve()\n\nconst origin = `http://localhost:${serve.port}`\nlet scCount = 0\n\nexport default class BrowserCtrl {\n    doBeforeAll({ path }: { path: string }) {\n        beforeAll(() => this.load(path))\n        afterAll(() => this.destroy())\n    }\n\n    async load(path: string) {\n        this.browser = await puppeteer.launch({ headless: true })\n        this.page = await this.browser.newPage()\n        await this.page.goto(`${origin}/${path}`, { waitUntil: \'networkidle0\' })\n        await this.screenshot(path, {fullPage: true})\n    }\n\n    async destroy() {\n        await this.page?.close()\n        await this.browser?.close()\n    }\n\n    screenshot(name: string, opts: ScreenshotOptions = {}) {\n        name ||= \'home\'\n        return this.page?.screenshot({ path: `${SCREENSHOTS_DIR}/${++scCount}-${name}.png`, ...opts })\n    }\n}\n```\n\n#Running Tests\n\n```typescript\n\ndescribe(\'Given there are 3 questions in the database When the question-list route is loaded\', { sanitizeResources: false, sanitizeOps: false }, () => {\n    browserCtrl.doBeforeAll({ path: \'\' })\n\n    it(\'Then they are displayed in a list\', async () => {\n        const count = await browserCtrl.page?.$$eval(\'.questionListItem\', nodes => nodes.length)\n        assertEquals(count, 3)\n    })\n})\n```', NULL),
(24, 1, 2, '2022-04-22 22:26:13', '# CI Pipeline\n\nIn a Github Workflow, it looks something like this:\n\n```yaml\njobs\n  test_ui:\n    runs-on: ubuntu-latest\n    needs: lint\n    steps:\n      - name: Set up repo\n        uses: actions/checkout@v2\n\n      - name: Set up Deno\n        uses: denolib/setup-deno@v2\n        with:\n          deno-version: v1.21.x\n\n      - name: Install NPM deps and generate code\n        run: deno task build\n\n      - name: Run UI Tests\n        run: |\n          echo \"Installing Puppeteer\"\n          PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@9.0.2/install.ts\n          echo \"Running UI Tests\"\n          deno test api/test/ui/ --allow-all --unstable --import-map importmap.json\n```', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `keywords`
--

CREATE TABLE `keywords` (
  `id` varchar(50) NOT NULL,
  `text` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

CREATE TABLE `locations` (
  `id` int(10) UNSIGNED NOT NULL,
  `lon` float NOT NULL,
  `lat` float NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` int(10) UNSIGNED NOT NULL,
  `filename` varchar(255) NOT NULL,
  `filetype` enum('image','video','audio') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `media`
--

INSERT INTO `media` (`id`, `filename`, `filetype`) VALUES
(1, '1-1651616408418.png', 'image'),
(2, '2-1651625720705.jpeg', 'image'),
(3, '3-1651655864560.jpeg', 'image');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `created` timestamp NOT NULL DEFAULT current_timestamp(),
  `title` varchar(100) NOT NULL,
  `summary` varchar(200) NOT NULL,
  `body` text NOT NULL,
  `resolution_id` int(10) UNSIGNED DEFAULT NULL,
  `image_id` int(10) UNSIGNED DEFAULT NULL,
  `location_id` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `user_id`, `created`, `title`, `summary`, `body`, `resolution_id`, `image_id`, `location_id`) VALUES
(1, 1, '2022-04-22 06:45:19', 'How does one automate UI testing?', 'I currently run tests locally but I have to manually start my dev server first!\n\nI want a generic solution. Ideally utilising Github workflows', '# CI Requirements\n\nI need an automatic CI pipeline that includes UI testing (see attached image). It must:\n* Operate headless\n* Run as a single automated process (single step)\n* Support mocking (for testing edge-case)', NULL, 1, NULL),
(2, 2, '2022-04-22 07:49:28', 'Wha\'s the deal with Custom HTML Elements? ', 'Are the some kind of magic? Are they better than just using like normal elements and attaching listeners? \n\nAlso what\'s wrong with jQuery anywayz?', '# Challenge!\n\nCan anyone make this better with a custom html element:\n\n```html\n<form>\n     <textarea name=\"mytext\">\n        # Some Markdown text\n\n\n        Blah Blah Blah\n     </textarea>\n</form>\n```\n\n\n```typescript\nconst myObserver = new ResizeObserver( entries => {\n	console.log(\'resize\')\n	entries.forEach( entry => {\n		console.log(entry)\n		if(entry.contentRect.width === window.innerWidth) {\n			entry.target.classList.add(\'narrow\')\n		} else {\n			entry.target.classList.remove(\'narrow\')\n		}\n	})\n})\n\nmyObserver.observe(document.querySelector(\'textarea[name=\"mytext\"]\'))\n\n\n```\n\n\n## Winners!\nI\'ll update this table with the winning answerers:\n\n---------\n| Position | Answer By |\n| ------------|----------------|\n|   1          |             TBC |\n|   2 | TBC |\n|3 | TBC |', NULL, 2, NULL),
(3, 3, '2022-04-22 18:37:43', 'What features have been implemented?', 'And why is site is called “Definitely not Stack Overflow”.\n\nIs it a joke that I’m not getting?', 'I mean… it’s not even remotely like Stack Overflow.\n\nPerhaps if it has an answer voting button but I guess we ran out of time for that one!\n\n\nAnywho… which of the following features does it have? Please provide the following:\n\n|Feature | Completeness | Details |\n|------------|----------|----------|\n| The Name & number| Which sub-features<br> (perhaps a %)|Any additional info|\n\nBelow are the FAQ requirements, for reference:\n------\n\n## Feature 1 😎\n\nUsers don\'t need to be logged in to view the homepage however if they are logged inthere should be an **Add question** button or link that takes `users` to a screen where they can ask their own questions. They should supply:\n\n1. A brief title\n2. A short multi-line summary of no more than 200 characters.\n3. A detailed, formatted, multi-line description of the question. This should support the use of _markdown_ formatting.\n4. an optional image (screenshot or photo) that should be uploaded from their computer.\n\nIn addition, the following data should be captured without the user needing to enter it:\n\n1. The username of the person asking the question.\n2. The date and time when the question was posted.\n\n> To demonstrate this feature and to prove that the form works correctly you will need to show that the data is being persisted correctly, either by running a database query or an API call depending on the platform and technology you are using.\n\n## Feature 2 😎\n\nThe home screen should display a list of the questions that `users` have asked. This should include:\n\n1. The title\n2. The short multi-line summary.\n3. The username of the person asking the question.\n4. The date (but not the time) when the question was posted.\n\n## Feature 3 😎\n\nIf the `user` clicks on one of the titles on the homepage they should be taken to a **Details** page which includes the following features:\n\n1. The title\n2. The short multi-line summary.\n3. The detailed, formatted, multi-line description of the question with _markdown_ formatting converted to html.\n4. The image (screenshot or photo) if supplied.\n5. The username of the person asking the question.\n6. The date (but not the time) when the question was posted.\n\n## Feature 4 😎\n\nThis feature requires you to make changes to the functionality and allow users to answer each others\' questions:\n\n1. If a user views a question posted by someone else (but not themselves) they should see a multiline text box at the bottom of the page that supports _markdown_ formatting and an **Answer question** button or link.\n2. if they submit an answer this needs to be stored in the database together with the following information (not input by the user):\n    1. The username of the person posting the answer.\n    2. The date and time the answer was posted.\n3. If there are answers posted by one or more users, these should appear between the question information and the text area where new answers can be posted. The answers should be posted in chronological order with the latest at the bottom and each should include:\n    1. The details of the answer (with _markdown_ converted to html).\n    2. The username of the person who posted the answer.\n    3. The date (but not the time) when the answer was posted.\n\n## Feature 5 🌦\n\n1. ~~If the user who posted a question has recieved one or more answers there should be a **Mark as correct** link or button next to each answer. If the original poster clicks on one of these, that answer is marked as correct and the links or buttons are no longer displayed. This correct answer should be clearly flagged.~~\n2. Each of the questions on the homepage should be automatically flagged in one of these three categories:\n    1. unanswered (no-one has provided an answer).\n    2. answered (there is at least one answer provided).\n    3. solved (the person asking the question has flagged an answer as correct).\n3. ~~When a user adds a question they should be prompted to add one or more keywords (separated by spaces). The homepage should include the top 10 keywords. Clicking on one of these filters the questions to only display questions that are flagged with that keyword.~~\n\n----\n\n## ~~Extras~~\n\n---\n\nSee original for more details: [Frequently Asked Questions.md](https://github.coventry.ac.uk/agile/projects/blob/master/07%20Frequently%20Asked%20Questions.md)', NULL, 3, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `question_keywords`
--

CREATE TABLE `question_keywords` (
  `id` int(10) UNSIGNED NOT NULL,
  `question_id` int(10) UNSIGNED NOT NULL,
  `keyword_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `username` varchar(20) NOT NULL,
  `password_hash` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password_hash`) VALUES
(1, 'user1', '$2b$10$gL33obKAFUT5DK3pEbh72OIHztsWBniBBh.PdeKOrF1yr5KFAsdZO'),
(2, 'user2', '$2b$10$gL33obKAFUT5DK3pEbh72OIHztsWBniBBh.PdeKOrF1yr5KFAsdZO'),
(3, 'user3', '$2b$10$gL33obKAFUT5DK3pEbh72OIHztsWBniBBh.PdeKOrF1yr5KFAsdZO'),
(4, 'max', '$2a$10$sHUGo6jVwBiEoXNWgTmUlOLe2HEC5IhC2NGKIQ1R.gBY7TcIyX5mK');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `answer_question` (`question_id`),
  ADD KEY `answer_location` (`location_id`);

--
-- Indexes for table `keywords`
--
ALTER TABLE `keywords`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `locations`
--
ALTER TABLE `locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_question` (`user_id`),
  ADD KEY `question_image` (`image_id`),
  ADD KEY `question_location` (`location_id`);

--
-- Indexes for table `question_keywords`
--
ALTER TABLE `question_keywords`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_keyword` (`question_id`),
  ADD KEY `keyword_question` (`keyword_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `answers`
--
ALTER TABLE `answers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `locations`
--
ALTER TABLE `locations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `question_keywords`
--
ALTER TABLE `question_keywords`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `answer_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `answer_question` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `question_image` FOREIGN KEY (`image_id`) REFERENCES `media` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  ADD CONSTRAINT `question_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `user_question` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `question_keywords`
--
ALTER TABLE `question_keywords`
  ADD CONSTRAINT `keyword_question` FOREIGN KEY (`keyword_id`) REFERENCES `keywords` (`id`),
  ADD CONSTRAINT `question_keyword` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;
