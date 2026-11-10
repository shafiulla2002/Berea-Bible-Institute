  /**
 * BEREA BIBLE INSTITUTE & THEOLOGICAL SEMINARY
 * Comprehensive Bible Course Catalog Dataset & Query Functions
 */

const SAMPLE_COURSES = [
  {
    id: 'course-bib-101',
    code: 'BIB-101',
    title: 'Introduction to Biblical Greek (Koine)',
    slug: 'intro-biblical-greek',
    category: 'Biblical Languages',
    level: 'Beginner',
    duration: '12 Weeks',
    studyMode: 'Online Interactive',
    credits: 3,
    price: 280,
    registrationFee: 35,
    featured: true,
    recentlyAdded: false,
    popularity: 98,
    instructor: {
      name: 'Dr. Paul Apostle',
      title: 'Professor of New Testament & Hellenistic Greek',
      credentials: 'Ph.D., Th.M., University of Cambridge',
      avatar: 'PA',
      bio: 'Dr. Apostle has taught Koine Greek for over 22 years, mentoring scholars in syntactical exegesis and textual criticism.'
    },
    shortDesc: 'Master foundational Koine Greek grammar, vocabulary, noun declensions, and verb conjugations to translate the New Testament directly from original manuscripts.',
    fullDesc: 'This course provides a comprehensive introduction to the grammar, syntax, and vocabulary of the Greek New Testament. Students acquire reading knowledge of the text of the Gospels and Epistles, building a lifelong foundation for exegetical precision and deeper sermon preparation.',
    objectives: [
      'Master the Greek alphabet, accents, and pronunciation rules',
      'Acquire core vocabulary of the top 350 most common Greek words in the NT',
      'Analyze noun declensions (1st, 2nd, and 3rd) and case functions',
      'Translate narrative passages from 1 John and the Gospel of Mark',
      'Utilize digital lexical tools, interlinears, and critical apparatus'
    ],
    curriculum: [
      { module: 'Module 1: The Alphabet, Phonetics & Basic Accentuation', lessons: 4 },
      { module: 'Module 2: The Second & First Declension Nouns', lessons: 6 },
      { module: 'Module 3: Present Active & Middle/Passive Indicative Verbs', lessons: 8 },
      { module: 'Module 4: Prepositions, Personal Pronouns & Adjectives', lessons: 6 },
      { module: 'Module 5: Imperfect & Aorist Tense Stems', lessons: 8 },
      { module: 'Module 6: Exegetical Translation Workshop: 1 John', lessons: 4 }
    ],
    eligibility: 'High School Diploma or equivalent. No prior language experience required.',
    nextBatch: 'June 1, 2026',
    availableBatches: ['June 1, 2026 - Morning', 'July 15, 2026 - Evening', 'September 1, 2026 - Weekend'],
    color: '#7A1931',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-bib-202',
    code: 'BIB-202',
    title: 'Biblical Hebrew Grammar & Syntax',
    slug: 'biblical-hebrew-grammar',
    category: 'Biblical Languages',
    level: 'Intermediate',
    duration: '14 Weeks',
    studyMode: 'Online Interactive',
    credits: 4,
    price: 320,
    registrationFee: 35,
    featured: true,
    recentlyAdded: true,
    popularity: 92,
    instructor: {
      name: 'Dr. Sarah Cohen',
      title: 'Senior Lecturer in Semitic Studies',
      credentials: 'Ph.D., Hebrew University of Jerusalem',
      avatar: 'SC',
      bio: 'Author of three textbooks on Classical Hebrew prose and poetry with 18 years of academic teaching experience.'
    },
    shortDesc: 'Unlock the rich poetry and narrative of the Old Testament through Classical Hebrew script, morphology, vowel pointings, and verb stems.',
    fullDesc: 'Explore the grammar and vocabulary of Ancient Biblical Hebrew. Students learn the writing system, morphology, and syntax, translating selections from Genesis, Psalms, and Isaiah.',
    objectives: [
      'Recognize and write Hebrew consonants and Tiberian vowel pointings',
      'Grasp the nominal sentence and construct chain dynamics',
      'Master the seven verb stems (Qal, Niphal, Piel, Pual, Hiphil, Hophal, Hithpael)',
      'Translate classical prose from Genesis 1-11 and poetic texts from the Psalms'
    ],
    curriculum: [
      { module: 'Module 1: Hebrew Orthography, Pointing & Syllabification', lessons: 5 },
      { module: 'Module 2: The Strong Verb: Qal Perfect and Imperfect', lessons: 7 },
      { module: 'Module 3: Nouns, Construct State & Pronominal Suffixes', lessons: 6 },
      { module: 'Module 4: The Derived Stems & Weak Verb Formations', lessons: 9 },
      { module: 'Module 5: Exegesis of Narrative: Selections from Genesis', lessons: 5 }
    ],
    eligibility: 'Introductory Bible Survey or equivalent undergraduate coursework.',
    nextBatch: 'June 15, 2026',
    availableBatches: ['June 15, 2026 - Evening', 'August 1, 2026 - Saturday Intensive'],
    color: '#93712C',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-the-101',
    code: 'THE-101',
    title: 'Foundations of Systematic Theology',
    slug: 'foundations-systematic-theology',
    category: 'Systematic Theology',
    level: 'Beginner',
    duration: '10 Weeks',
    studyMode: 'Hybrid / Self-Paced',
    credits: 3,
    price: 195,
    registrationFee: 35,
    featured: true,
    recentlyAdded: false,
    popularity: 96,
    instructor: {
      name: 'Rev. Dr. John Mark',
      title: 'Dean of Biblical Theology & Historical Dogmatics',
      credentials: 'D.D., Th.D., Dallas Theological Seminary',
      avatar: 'JM',
      bio: 'Pastor and theologian dedicated to integrating rigorous Reformed dogmatics with vital spiritual vitality and church leadership.'
    },
    shortDesc: 'A rigorous survey of core Christian doctrines: Revelation, the Triune God, Creation, the Fall, Christology, Pneumatology, and Eschatology.',
    fullDesc: 'Ground your faith in the coherent theological structure of Sacred Scripture. This course walks through the major loci of Christian dogma, examining scriptural witness, historical debates, and pastoral applications.',
    objectives: [
      'Articulate the biblical defense for the Trinity, hypostatic union, and divine sovereignty',
      'Distinguish between General and Special Revelation, verbal plenary inspiration, and biblical inerrancy',
      'Critique historical heresies and contemporary deviations',
      'Apply systematic doctrines to daily discipleship, ethics, and corporate worship'
    ],
    curriculum: [
      { module: 'Module 1: Prolegomena & the Doctrine of the Word of God (Bibliology)', lessons: 6 },
      { module: 'Module 2: The Being & Attributes of the Triune God (Theology Proper)', lessons: 6 },
      { module: 'Module 3: Humanity, Creation & the Origin of Sin (Anthropology & Hamartiology)', lessons: 6 },
      { module: 'Module 4: The Person & Work of Jesus Christ (Christology & Atonement)', lessons: 8 },
      { module: 'Module 5: The Holy Spirit, Church & Last Things (Pneumatology & Eschatology)', lessons: 6 }
    ],
    eligibility: 'Open to all students desiring theological depth.',
    nextBatch: 'May 20, 2026',
    availableBatches: ['May 20, 2026 - Self-Paced Cohort', 'July 1, 2026 - Evening Cohort'],
    color: '#3D0C17',
    image: 'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-bib-305',
    code: 'BIB-305',
    title: 'Exegesis of the Epistle to the Romans',
    slug: 'exegesis-epistle-romans',
    category: 'Biblical Languages',
    level: 'Advanced',
    duration: '10 Weeks',
    studyMode: 'Online Interactive',
    credits: 3,
    price: 250,
    registrationFee: 35,
    featured: false,
    recentlyAdded: true,
    popularity: 89,
    instructor: {
      name: 'Dr. Nicholas Thomas',
      title: 'Chair of Pauline Studies',
      credentials: 'Ph.D., Oxford University',
      avatar: 'NT',
      bio: 'Leading researcher in Pauline literature, justification by faith, and Greco-Roman rhetorical epistolary style.'
    },
    shortDesc: 'Verse-by-verse analytical study of Paul’s magnum opus, focusing on divine righteousness, justification, sanctification, election, and ethics.',
    fullDesc: 'Romans has sparked every major spiritual awakening in church history. In this seminar, students dissect the Greek text, structural discourse, theological themes, and pastoral implications of Paul’s foundational letter.',
    objectives: [
      'Analyze the rhetorical flow and argumentative structure of Romans 1-16',
      'Examine the theological mechanics of imputation, propitiation, and glorification',
      'Evaluate historical interpretations from Augustine, Luther, Calvin, and contemporary New Perspective',
      'Formulate sound preaching and teaching outlines from complex Pauline paragraphs'
    ],
    curriculum: [
      { module: 'Module 1: Introduction, Occasion, and Romans 1:1-17 Thesis', lessons: 4 },
      { module: 'Module 2: Universal Need: The Condemnation of Mankind (1:18–3:20)', lessons: 6 },
      { module: 'Module 3: Righteousness Imputed: Justification by Faith (3:21–5:21)', lessons: 8 },
      { module: 'Module 4: Freedom & Assurance: Sanctification and Romans 8 Triumph', lessons: 8 },
      { module: 'Module 5: Israel in God’s Plan & Christian Ethics (9–16)', lessons: 6 }
    ],
    eligibility: 'Basic Greek recommended or concurrent enrollment in BIB-101.',
    nextBatch: 'June 10, 2026',
    availableBatches: ['June 10, 2026 - Tuesday & Thursday Seminars'],
    color: '#621427',
    image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-pas-201',
    code: 'PAS-201',
    title: 'Biblical Hermeneutics & Expository Preaching',
    slug: 'biblical-hermeneutics-expository-preaching',
    category: 'Pastoral Ministry',
    level: 'Intermediate',
    duration: '8 Weeks',
    studyMode: 'Online Interactive',
    credits: 3,
    price: 210,
    registrationFee: 35,
    featured: true,
    recentlyAdded: false,
    popularity: 95,
    instructor: {
      name: 'Pastor Timothy Disciple',
      title: 'Director of Homiletics & Pastoral Formation',
      credentials: 'M.Div., Reformed Theological Seminary',
      avatar: 'TD',
      bio: 'Senior pastor with 25 years of pulpit ministry, training preachers globally in Christ-centered biblical exposition.'
    },
    shortDesc: 'Bridge the ancient text to contemporary hearts. Learn grammatical-historical interpretation and develop compelling expository sermons.',
    fullDesc: 'This practical course trains pastors, teachers, and small group leaders in moving from text to pulpit. Learn sound interpretive principles across narrative, poetry, prophecy, and epistolary genres, crafting sermons that honor the biblical author’s intent.',
    objectives: [
      'Apply the historical-grammatical method across different literary genres',
      'Avoid common interpretive fallacies and allegorical missteps',
      'Craft a big idea and expository outline directly from the biblical pericope',
      'Deliver sermons with theological depth, pastoral warmth, and urgent application'
    ],
    curriculum: [
      { module: 'Module 1: Foundations of Hermeneutics & the Role of the Spirit', lessons: 4 },
      { module: 'Module 2: Historical, Cultural & Literary Context Analysis', lessons: 6 },
      { module: 'Module 3: Interpreting OT Narratives, Psalms, and Wisdom Literature', lessons: 6 },
      { module: 'Module 4: Developing the Sermon Structure: From Exegesis to Homiletic Outline', lessons: 6 },
      { module: 'Module 5: Preaching Practicum: Peer Review and Evaluation', lessons: 4 }
    ],
    eligibility: 'Open to pastors, ministry leaders, and aspiring teachers.',
    nextBatch: 'July 5, 2026',
    availableBatches: ['July 5, 2026 - Evening Cohort', 'September 12, 2026 - Weekend Cohort'],
    color: '#AF8838',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-his-102',
    code: 'HIS-102',
    title: 'Early Church Fathers & Ecumenical Councils',
    slug: 'early-church-fathers-councils',
    category: 'Church History',
    level: 'Intermediate',
    duration: '10 Weeks',
    studyMode: 'Hybrid',
    credits: 3,
    price: 220,
    registrationFee: 35,
    featured: false,
    recentlyAdded: true,
    popularity: 88,
    instructor: {
      name: 'Dr. Athanasius Vance',
      title: 'Professor of Patristics & Historical Studies',
      credentials: 'Ph.D., University of Edinburgh',
      avatar: 'AV',
      bio: 'Specialist in second- to fifth-century Christian literature, early monasticism, and the Trinitarian debates of Nicaea and Constantinople.'
    },
    shortDesc: 'Trace the development of orthodox dogma, martyrdom, and apologetics through the Apostolic Fathers and the first four Ecumenical Councils.',
    fullDesc: 'Meet the men and women who defended the apostolic deposit against pagan persecutions and early heresies. Examine primary texts from Ignatius of Antioch, Justin Martyr, Irenaeus, Athanasius, and Augustine.',
    objectives: [
      'Examine the historical context of the Roman persecutions and martyrdom accounts',
      'Analyze the Christological and Trinitarian formulations of Nicaea, Constantinople, and Chalcedon',
      'Evaluate early monastic movements and patristic pastoral theology',
      'Connect early church controversies to contemporary doctrinal challenges'
    ],
    curriculum: [
      { module: 'Module 1: The Apostolic Fathers & the Post-Apostolic Era', lessons: 5 },
      { module: 'Module 2: The Apologists & Defense against Gnosticism (Irenaeus & Tertullian)', lessons: 6 },
      { module: 'Module 3: The Arian Crisis and the Council of Nicaea (325 AD)', lessons: 7 },
      { module: 'Module 4: Augustine, Pelagius & the Battle over Grace', lessons: 6 },
      { module: 'Module 5: The Council of Chalcedon (451 AD) & Legacy for the Church', lessons: 4 }
    ],
    eligibility: 'General interest in Christian history.',
    nextBatch: 'July 10, 2026',
    availableBatches: ['July 10, 2026 - Online Cohort'],
    color: '#26070E',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-apo-201',
    code: 'APO-201',
    title: 'Classical Christian Apologetics & Worldviews',
    slug: 'classical-christian-apologetics',
    category: 'Apologetics & Ethics',
    level: 'Intermediate',
    duration: '8 Weeks',
    studyMode: 'Online Interactive',
    credits: 3,
    price: 200,
    registrationFee: 35,
    featured: false,
    recentlyAdded: false,
    popularity: 91,
    instructor: {
      name: 'Prof. C.S. Lewis Fellow',
      title: 'Senior Fellow in Philosophy & Culture',
      credentials: 'M.A., Ph.D., Oxford Centre for Christian Apologetics',
      avatar: 'CF',
      bio: 'Engaging speaker and author addressing contemporary secular skepticism, epistemology, and the defense of the historical Resurrection.'
    },
    shortDesc: 'Equip yourself to give a reasoned, gracious defense of Christian faith against atheism, naturalism, moral relativism, and Eastern pantheism.',
    fullDesc: 'Fulfill the 1 Peter 3:15 mandate with intellectual rigor and compassionate clarity. This course explores the classical arguments for God’s existence, the historical reliability of the Gospels, and answers to the problem of evil.',
    objectives: [
      'Analyze cosmological, teleological, moral, and ontological arguments for theism',
      'Demonstrate the historical evidence for the bodily resurrection of Jesus Christ',
      'Provide biblical answers to the problem of suffering, pain, and evil',
      'Engage modern culture with gentle persuasiveness and intellectual integrity'
    ],
    curriculum: [
      { module: 'Module 1: Faith, Reason & Epistemology: Why Apologetics Matters', lessons: 4 },
      { module: 'Module 2: Arguments for God’s Existence: Science & Philosophy', lessons: 6 },
      { module: 'Module 3: The Problem of Evil & Suffering (Theodicy)', lessons: 5 },
      { module: 'Module 4: The Historical Reliability of Scripture & the Resurrection', lessons: 6 },
      { module: 'Module 5: Postmodernism, Moral Relativism & Cross-Cultural Engagement', lessons: 5 }
    ],
    eligibility: 'Open to all students.',
    nextBatch: 'June 20, 2026',
    availableBatches: ['June 20, 2026 - Evening Cohort'],
    color: '#785B22',
    image: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-bib-110',
    code: 'BIB-110',
    title: 'Old Testament Survey: Pentateuch & Historical Books',
    slug: 'old-testament-survey-pentateuch',
    category: 'Biblical Studies',
    level: 'Beginner',
    duration: '12 Weeks',
    studyMode: 'Hybrid',
    credits: 3,
    price: 230,
    registrationFee: 35,
    featured: false,
    recentlyAdded: false,
    popularity: 93,
    instructor: {
      name: 'Dr. Samuel Miller',
      title: 'Professor of Old Testament Literature',
      credentials: 'Ph.D., Trinity Evangelical Divinity School',
      avatar: 'SM',
      bio: 'Over 30 years dedicated to teaching the redemptive narrative of the Hebrew Scriptures.'
    },
    shortDesc: 'A panoramic journey through the covenants, tabernacle worship, monarchy, and exile, seeing Christ foreshadowed in the Law and Prophets.',
    fullDesc: 'Discover the overarching redemptive narrative of the Hebrew Scriptures from Genesis to Esther. Understand covenantal theology, Israelite history, geography, and archaeological discoveries illuminating the text.',
    objectives: [
      'Trace the redemptive covenants from Adam, Noah, Abraham, Moses, to David',
      'Understand the historical and archaeological setting of ancient Israel and the Levant',
      'Analyze typological themes pointing to Christ in sacrificial ordinances and prophecies',
      'Apply Old Testament ethical and devotional insights to Christian living'
    ],
    curriculum: [
      { module: 'Module 1: Creation, Fall, and Patriarchal Covenants (Genesis)', lessons: 6 },
      { module: 'Module 2: The Exodus, Law & Tabernacle Typology (Exodus–Deuteronomy)', lessons: 8 },
      { module: 'Module 3: Conquest, Settlement & judges Era (Joshua–Ruth)', lessons: 6 },
      { module: 'Module 4: The United and Divided Monarchy (1-2 Samuel, 1-2 Kings)', lessons: 8 },
      { module: 'Module 5: Exile and Restoration (Chronicles, Ezra, Nehemiah, Esther)', lessons: 6 }
    ],
    eligibility: 'None.',
    nextBatch: 'August 10, 2026',
    availableBatches: ['August 10, 2026 - Morning Cohort'],
    color: '#4F101F',
    image: 'https://images.unsplash.com/photo-1509021436665-8f07dbf76572?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-bib-120',
    code: 'BIB-120',
    title: 'New Testament Survey: Gospels, Acts & Epistles',
    slug: 'new-testament-survey',
    category: 'Biblical Studies',
    level: 'Beginner',
    duration: '12 Weeks',
    studyMode: 'Hybrid',
    credits: 3,
    price: 230,
    registrationFee: 35,
    featured: true,
    recentlyAdded: false,
    popularity: 97,
    instructor: {
      name: 'Dr. Deborah Adams',
      title: 'Associate Professor of New Testament Studies',
      credentials: 'Ph.D., Fuller Theological Seminary',
      avatar: 'DA',
      bio: 'Award-winning educator passionate about contextual reading of the Gospels and the global expansion of the early Church in Acts.'
    },
    shortDesc: 'Examine the life of Christ, the missionary expansion of the early Church, and the theology of the apostolic epistles.',
    fullDesc: 'A comprehensive study of the 27 books of the New Testament. Learn the distinctive witness of each Gospel writer, the explosive spread of the Gospel in Acts, and the pastoral warmth of the apostolic letters.',
    objectives: [
      'Contrast the theological emphases of the Synoptic Gospels and the Gospel of John',
      'Trace the missionary journeys of the Apostle Paul and the expansion of the Church in Acts',
      'Synthesize key theological themes across Pauline, Johannine, and General Epistles',
      'Understand the apocalyptic imagery and ultimate victory proclaimed in Revelation'
    ],
    curriculum: [
      { module: 'Module 1: The Intertestamental Period & the Greco-Roman World', lessons: 4 },
      { module: 'Module 2: The Fourfold Gospel Witness: Matthew, Mark, Luke, John', lessons: 8 },
      { module: 'Module 3: The Birth & Expansion of the Church (Acts of the Apostles)', lessons: 6 },
      { module: 'Module 4: Pauline Epistles & Pastoral Guidance for Local Churches', lessons: 8 },
      { module: 'Module 5: General Epistles & the Triumphant Hope of Revelation', lessons: 6 }
    ],
    eligibility: 'None.',
    nextBatch: 'May 25, 2026',
    availableBatches: ['May 25, 2026 - Morning', 'July 20, 2026 - Evening'],
    color: '#931F3B',
    image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-pas-303',
    code: 'PAS-303',
    title: 'Pastoral Counseling & Spiritual Care',
    slug: 'pastoral-counseling-spiritual-care',
    category: 'Pastoral Ministry',
    level: 'Advanced',
    duration: '10 Weeks',
    studyMode: 'Online Interactive',
    credits: 3,
    price: 240,
    registrationFee: 35,
    featured: false,
    recentlyAdded: true,
    popularity: 87,
    instructor: {
      name: 'Dr. Elizabeth Wright',
      title: 'Clinical Director of Pastoral Care',
      credentials: 'D.Min., Psy.D., Wheaton Graduate School',
      avatar: 'EW',
      bio: 'Certified Christian counselor and author specializing in grief care, marital restoration, and trauma-informed spiritual direction.'
    },
    shortDesc: 'Integrate biblical wisdom and compassionate counseling skills to guide congregants through crisis, grief, marital distress, and addiction.',
    fullDesc: 'Equips ministry leaders with sound biblical counseling frameworks for soul care. Learn effective active listening, crisis intervention, ethics, referral protocols, and scriptural comfort for suffering individuals.',
    objectives: [
      'Develop a robust biblical theology of suffering, emotion, and sanctification',
      'Acquire diagnostic skills in differentiating spiritual, psychological, and physical distress',
      'Master confidential pastoral care protocols, mandatory reporting, and professional boundaries',
      'Facilitate healing through prayer, Scripture meditation, and structured counseling sessions'
    ],
    curriculum: [
      { module: 'Module 1: Foundations of Biblical Soul Care & Pastoral Ethics', lessons: 5 },
      { module: 'Module 2: Crisis Intervention, Grief & Bereavement Counseling', lessons: 6 },
      { module: 'Module 3: Marital Discord, Family Dynamics & Conflict Mediation', lessons: 7 },
      { module: 'Module 4: Guilt, Anxiety & Depression: Scriptural & Practical Approaches', lessons: 6 },
      { module: 'Module 5: Supervised Counseling Case Studies & Practicum', lessons: 4 }
    ],
    eligibility: 'Prior coursework in pastoral ministry or counseling recommended.',
    nextBatch: 'July 1, 2026',
    availableBatches: ['July 1, 2026 - Wednesday Evening Cohort'],
    color: '#C5A059',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-mis-101',
    code: 'MIS-101',
    title: 'Global Missions & Cross-Cultural Evangelism',
    slug: 'global-missions-evangelism',
    category: 'Pastoral Ministry',
    level: 'Beginner',
    duration: '6 Weeks',
    studyMode: 'Self-Paced',
    credits: 2,
    price: 150,
    registrationFee: 35,
    featured: false,
    recentlyAdded: false,
    popularity: 84,
    instructor: {
      name: 'Rev. David Paul',
      title: 'Director of Global Church Planting',
      credentials: 'M.A., Biola University',
      avatar: 'DP',
      bio: 'Former missionary in South Asia with 20 years planting churches in unreached urban centers.'
    },
    shortDesc: 'Explore the biblical mandate of the Great Commission, missionary history, contextualization, and practical cross-cultural witness.',
    fullDesc: 'Gain global perspective on what God is doing across the nations. This course explores the biblical basis of mission, cross-cultural communication, indigenous church planting, and mobilizing local congregations for global outreach.',
    objectives: [
      'Trace the Missio Dei from Genesis to Revelation',
      'Navigate cultural barriers, worldviews, and religious contexts with respect and boldness',
      'Examine successful case studies of indigenous church planting movements',
      'Formulate a personalized strategy for local and international missionary engagement'
    ],
    curriculum: [
      { module: 'Module 1: The Biblical Mandate: From Abraham to the Ends of the Earth', lessons: 4 },
      { module: 'Module 2: Highlights of Missionary History (Paul to William Carey)', lessons: 4 },
      { module: 'Module 3: Culture, Worldviews, and Contextualizing the Gospel', lessons: 5 },
      { module: 'Module 4: Church Planting Movements & Unreached People Groups', lessons: 5 }
    ],
    eligibility: 'None.',
    nextBatch: 'Open Enrollment',
    availableBatches: ['Self-Paced (Instant Access Upon Enrollment)'],
    color: '#15803D',
    image: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'course-the-204',
    code: 'THE-204',
    title: 'The Doctrine of Grace & Justification',
    slug: 'doctrine-grace-justification',
    category: 'Systematic Theology',
    level: 'Intermediate',
    duration: '6 Weeks',
    studyMode: 'Online Interactive',
    credits: 2,
    price: 160,
    registrationFee: 35,
    featured: false,
    recentlyAdded: true,
    popularity: 90,
    instructor: {
      name: 'Prof. Barnabas Son',
      title: 'Lecturer in Reformation Theology',
      credentials: 'Th.M., Westminster Theological Seminary',
      avatar: 'BS',
      bio: 'Specialist in the Solas of the Protestant Reformation and the historical development of the Ordo Salutis.'
    },
    shortDesc: 'An intensive exploration of Sola Gratia and Sola Fide—the heart of the Gospel that anchored the Reformation and revives believers.',
    fullDesc: 'Delve into the crown jewel of Christian soteriology: God’s unmerited favor through Christ. Explore covenantal grace, unconditional election, regeneration, justification by faith alone, and eternal security.',
    objectives: [
      'Articulate the difference between infused righteousness and imputed righteousness',
      'Trace the development of the doctrine of grace through the Reformation confessions',
      'Defend the biblical harmony between justification by faith and active good works',
      'Experience deep spiritual assurance resting solely in Christ’s finished work'
    ],
    curriculum: [
      { module: 'Module 1: Grace Defined: Common Grace and Saving Grace in Scripture', lessons: 4 },
      { module: 'Module 2: The Pelagian & Semi-Pelagian Controversies', lessons: 4 },
      { module: 'Module 3: Justification by Faith Alone (Sola Fide) & the Law', lessons: 5 },
      { module: 'Module 4: The Order of Salvation (Ordo Salutis) and Final Perseverance', lessons: 5 }
    ],
    eligibility: 'Completion of THE-101 or equivalent reading.',
    nextBatch: 'July 15, 2026',
    availableBatches: ['July 15, 2026 - Evening Seminars'],
    color: '#7A1931',
    image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80'
  }
];

// Helper Functions
function getAllCourses() {
  return SAMPLE_COURSES;
}

function getCourseById(id) {
  return SAMPLE_COURSES.find(c => c.id === id || c.slug === id || c.code.toLowerCase() === id.toLowerCase());
}

function getFeaturedCourses() {
  return SAMPLE_COURSES.filter(c => c.featured);
}

function getCategories() {
  const cats = new Set(SAMPLE_COURSES.map(c => c.category));
  return Array.from(cats);
}

/**
 * Filter & Search function for Catalogue
 */
function queryCourses({ search = '', category = 'ALL', level = 'ALL', mode = 'ALL', duration = 'ALL', sort = 'featured' } = {}) {
  let list = [...SAMPLE_COURSES];

  // Search filter
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    list = list.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.shortDesc.toLowerCase().includes(q) ||
      c.instructor.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (category && category !== 'ALL') {
    list = list.filter(c => c.category === category);
  }

  // Level filter
  if (level && level !== 'ALL') {
    list = list.filter(c => c.level.toUpperCase() === level.toUpperCase());
  }

  // Study Mode filter
  if (mode && mode !== 'ALL') {
    list = list.filter(c => c.studyMode.toLowerCase().includes(mode.toLowerCase()));
  }

  // Duration filter
  if (duration && duration !== 'ALL') {
    if (duration === 'short') list = list.filter(c => parseInt(c.duration) <= 8);
    else if (duration === 'medium') list = list.filter(c => parseInt(c.duration) > 8 && parseInt(c.duration) <= 12);
    else if (duration === 'long') list = list.filter(c => parseInt(c.duration) > 12);
  }

  // Sorting
  switch (sort) {
    case 'price-asc':
      list.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      list.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'newest':
      list.sort((a, b) => (b.recentlyAdded ? 1 : 0) - (a.recentlyAdded ? 1 : 0));
      break;
    case 'featured':
    default:
      list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.popularity - a.popularity);
      break;
  }

  return list;
}

/**
 * Check if a student has already purchased / enrolled in a course
 */
function isCourseEnrolled(courseId) {
  if (!courseId) return false;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem('berea_enrolled_courses') : null;
    if (!raw) return false;
    const enrolled = JSON.parse(raw);
    const target = courseId.toLowerCase();
    return enrolled.some(item => {
      const cId = (item.courseId || item.id || '').toLowerCase();
      const code = (item.code || '').toLowerCase();
      return cId === target || code === target;
    });
  } catch (e) {
    return false;
  }
}

/**
 * Generate course card HTML
 */
function createCourseCardHTML(course) {
  const isAuth = typeof isStudentAuthenticated === 'function' 
    ? isStudentAuthenticated() 
    : (typeof localStorage !== 'undefined' && localStorage.getItem('berea_auth_student') !== null);

  const isEnrolled = isCourseEnrolled(course.id);

  let buyBtnText = 'Sign Up to Buy';
  let buyBtnClass = 'btn-gold';
  let buyBtnIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7.5" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>`;

  if (isEnrolled) {
    buyBtnText = '✓ Enrolled';
    buyBtnClass = 'btn-secondary btn-already-enrolled';
    buyBtnIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (isAuth) {
    buyBtnText = 'Add to Cart';
    buyBtnClass = 'btn-primary';
    buyBtnIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>`;
  }

  const imageSrc = course.image || 'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?auto=format&fit=crop&w=800&q=80';

  return `
    <article class="course-card" data-course-id="${course.id}">
      <div class="course-thumb">
        <img src="${imageSrc}" alt="${course.title}" class="course-thumb-img" loading="lazy" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1507842229451-7f01be8610ce?auto=format&fit=crop&w=800&q=80';">
        <div class="course-thumb-overlay"></div>
        <span class="course-badge-category">${course.category}</span>
        <span class="course-badge-level">${course.level}</span>
        ${isEnrolled ? `<span style="position:absolute; bottom:10px; left:10px; background:#15803D; color:#FFFFFF; font-size:0.68rem; font-weight:800; padding:0.25rem 0.55rem; border-radius:4px; letter-spacing:0.04em; box-shadow:0 2px 5px rgba(0,0,0,0.4);">✓ PURCHASED</span>` : ''}
      </div>

      <div class="course-body">
        <div class="course-code-wrap">
          <span class="course-code">${course.code}</span>
          <span class="course-duration">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            ${course.duration} (${course.credits} cr)
          </span>
        </div>

        <h3 class="course-title">
          <a href="course-details.html?id=${course.id}">${course.title}</a>
        </h3>

        <p class="course-desc">${course.shortDesc}</p>

        <div class="course-faculty">
          <div class="faculty-avatar">${course.instructor.avatar}</div>
          <div class="faculty-info">
            <span class="faculty-name">${course.instructor.name}</span>
            <span class="faculty-role">${course.instructor.title.split(',')[0]}</span>
          </div>
        </div>
      </div>

      <div class="course-footer">
        <div class="course-price-block">
          <span class="price-label">Tuition Fee</span>
          <span class="price-amount">$${course.price}</span>
        </div>
        <div class="course-actions">
          <a href="course-details.html?id=${course.id}" class="btn btn-secondary btn-sm">Details</a>
          ${isEnrolled ? `
            <a href="student-dashboard.html" class="btn btn-secondary btn-sm" style="font-weight:700; color:var(--burgundy-900); border-color:var(--burgundy-700);" title="You already purchased this course. Go to My Portal">
              ${buyBtnIcon} My Portal
            </a>
          ` : `
            <button type="button" class="btn ${buyBtnClass} btn-sm btn-add-cart" data-id="${course.id}" title="${isAuth ? 'Add this course to your enrollment cart' : 'Sign up for a free student account to buy and enroll in this course'}">
              ${buyBtnIcon}
              ${buyBtnText}
            </button>
          `}
        </div>
      </div>
    </article>
  `;
}
