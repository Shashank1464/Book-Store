/* ============================================================
   BookVerse — State Management & LocalStorage Layer
   ============================================================ */

window.BV = window.BV || {};

BV.Store = (() => {
  /* ─────────────────────────────────────────
     Seed Data
  ───────────────────────────────────────── */
  const CATEGORY_GRADIENTS = {
    'Fiction':     ['#667eea','#764ba2'],
    'Sci-Fi':      ['#0f3460','#533483'],
    'Fantasy':     ['#1a472a','#52b788'],
    'Dystopian':   ['#434343','#1a1a2e'],
    'Romance':     ['#c94b4b','#4b134f'],
    'History':     ['#8b6914','#4a3728'],
    'Self-Help':   ['#c25e0e','#7b2d00'],
    'Psychology':  ['#4e54c8','#1a1a5e'],
    'Finance':     ['#005c32','#1a4a2e'],
    'Science':     ['#007cf0','#003080'],
    'Thriller':    ['#1a1a2e','#2d0a0a'],
    'Biography':   ['#8e2de2','#4a00e0'],
    'Children':    ['#f7971e','#c45c00'],
    'Non-Fiction': ['#2c3e50','#1a252f'],
    'Philosophy':  ['#3d5a80','#1b2838'],
  };

  const SEED_BOOKS = [
    { id:'b001', title:'The Great Gatsby', author:'F. Scott Fitzgerald', isbn:'978-0-7432-7356-5', category:'Fiction', price:12.99, originalPrice:16.99, rating:4.3, reviewCount:2847, stock:45, pages:180, publisher:'Scribner', language:'English', publishYear:1925, featured:true, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg', description:'A story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan. Set in the Jazz Age on Long Island, near New York City, the novel depicts narrator Nick Carraway\'s interactions with mysterious millionaire Jay Gatsby and Gatsby\'s obsession to reunite with his former lover.' },
    { id:'b002', title:'To Kill a Mockingbird', author:'Harper Lee', isbn:'978-0-06-112008-4', category:'Fiction', price:14.99, originalPrice:18.99, rating:4.8, reviewCount:5412, stock:32, pages:281, publisher:'J.B. Lippincott & Co.', language:'English', publishYear:1960, featured:true, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg', description:'A Pulitzer Prize-winning masterwork of honor and injustice in the deep South. Through the young eyes of Scout and Jem Finch, Harper Lee explores the moral nature of human beings and the struggle of a single man\'s conscience against a town steeped in prejudice.' },
    { id:'b003', title:'1984', author:'George Orwell', isbn:'978-0-452-28423-4', category:'Dystopian', price:11.99, originalPrice:14.99, rating:4.7, reviewCount:7823, stock:60, pages:328, publisher:'Secker & Warburg', language:'English', publishYear:1949, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', description:'Among the most terrifying novels ever written. Winston Smith struggles to survive in a totalitarian society where Big Brother controls every aspect of life. A chilling depiction of a world where independent thinking is a crime.' },
    { id:'b004', title:'Dune', author:'Frank Herbert', isbn:'978-0-441-17271-9', category:'Sci-Fi', price:16.99, originalPrice:21.99, rating:4.6, reviewCount:4298, stock:28, pages:688, publisher:'Chilton Books', language:'English', publishYear:1965, featured:true, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg', description:'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is a "spice" that extends life and enhances consciousness.' },
    { id:'b005', title:'The Alchemist', author:'Paulo Coelho', isbn:'978-0-06-112241-5', category:'Fiction', price:13.99, originalPrice:17.99, rating:4.5, reviewCount:9102, stock:55, pages:197, publisher:'HarperOne', language:'English', publishYear:1988, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg', description:'A magical story about Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure as extravagant as any ever found. A story which speaks to the hearts of people of all ages.' },
    { id:'b006', title:'Sapiens: A Brief History of Humankind', author:'Yuval Noah Harari', isbn:'978-0-06-231609-7', category:'History', price:18.99, originalPrice:24.99, rating:4.6, reviewCount:6341, stock:40, pages:464, publisher:'Harper', language:'English', publishYear:2011, featured:true, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780062316110-L.jpg', description:'From a renowned historian comes a groundbreaking narrative of humanity\'s creation and evolution—a #1 international bestseller—that explores the ways in which biology and history have defined us and enhanced our understanding of what it means to be "human."' },
    { id:'b007', title:'Atomic Habits', author:'James Clear', isbn:'978-0-7352-1129-2', category:'Self-Help', price:15.99, originalPrice:19.99, rating:4.8, reviewCount:11243, stock:75, pages:320, publisher:'Avery', language:'English', publishYear:2018, featured:true, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', description:'No matter your goals, Atomic Habits offers a proven framework for improving—every day. James Clear reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.' },
    { id:'b008', title:"The Hitchhiker's Guide to the Galaxy", author:'Douglas Adams', isbn:'978-0-345-39180-3', category:'Sci-Fi', price:12.99, originalPrice:16.99, rating:4.7, reviewCount:3876, stock:50, pages:193, publisher:'Pan Books', language:'English', publishYear:1979, featured:false, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780345391803-L.jpg', description:'Seconds before the Earth is demolished to make way for a hyperspace bypass, Arthur Dent is plucked off the planet by his friend Ford Prefect, a researcher for the revised edition of The Hitchhiker\'s Guide to the Galaxy.' },
    { id:'b009', title:"Harry Potter and the Sorcerer's Stone", author:'J.K. Rowling', isbn:'978-0-439-70818-8', category:'Fantasy', price:19.99, originalPrice:24.99, rating:4.9, reviewCount:15823, stock:80, pages:309, publisher:'Scholastic', language:'English', publishYear:1997, featured:true, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg', description:'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. Addressed in green ink on yellowish parchment with a purple seal, they are swiftly confiscated by his grisly aunt and uncle.' },
    { id:'b010', title:'The Lord of the Rings', author:'J.R.R. Tolkien', isbn:'978-0-618-57494-1', category:'Fantasy', price:24.99, originalPrice:34.99, rating:4.9, reviewCount:12947, stock:35, pages:1178, publisher:'Allen & Unwin', language:'English', publishYear:1954, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780618640157-L.jpg', description:'One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them. In ancient times the Rings of Power were crafted by the Elven-smiths, and Sauron, the Dark Lord, forged the One Ring, filling it with his own power.' },
    { id:'b011', title:'Pride and Prejudice', author:'Jane Austen', isbn:'978-0-14-143951-8', category:'Romance', price:10.99, originalPrice:13.99, rating:4.7, reviewCount:8234, stock:65, pages:432, publisher:'T. Egerton', language:'English', publishYear:1813, featured:false, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg', description:'Since its immediate success in 1813, Pride and Prejudice has remained one of the most popular novels in the English language. Jane Austen called this brilliant work "her own darling child" and its vivacious heroine, Elizabeth Bennet, "as delightful a creature as ever appeared in print."' },
    { id:'b012', title:'Brave New World', author:'Aldous Huxley', isbn:'978-0-06-085052-4', category:'Dystopian', price:12.99, originalPrice:15.99, rating:4.4, reviewCount:4127, stock:42, pages:311, publisher:'Chatto & Windus', language:'English', publishYear:1932, featured:false, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg', description:"Aldous Huxley's profoundly changed the way we think about happiness and freedom. Its powerful vision of a society addicted to pleasure and conformity is more relevant now than ever." },
    { id:'b013', title:'The Midnight Library', author:'Matt Haig', isbn:'978-0-525-55947-4', category:'Fiction', price:16.99, originalPrice:22.99, rating:4.5, reviewCount:6832, stock:38, pages:288, publisher:'Viking', language:'English', publishYear:2020, featured:false, bestseller:false, newArrival:true, coverUrl:'https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg', description:'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices.' },
    { id:'b014', title:'Project Hail Mary', author:'Andy Weir', isbn:'978-0-593-13520-4', category:'Sci-Fi', price:17.99, originalPrice:22.99, rating:4.8, reviewCount:5923, stock:30, pages:476, publisher:'Ballantine Books', language:'English', publishYear:2021, featured:true, bestseller:false, newArrival:true, coverUrl:'https://covers.openlibrary.org/b/isbn/9780593135204-L.jpg', description:"Ryland Grace is the sole survivor on a desperate, last-chance mission—and if not for a few key memories that just recently returned, he wouldn't even know that. His crewmates dead, his memories returning, he slowly realizes he's billions of miles from home." },
    { id:'b015', title:'Thinking, Fast and Slow', author:'Daniel Kahneman', isbn:'978-0-374-27563-1', category:'Psychology', price:19.99, originalPrice:25.99, rating:4.6, reviewCount:7341, stock:48, pages:499, publisher:'Farrar, Straus and Giroux', language:'English', publishYear:2011, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg', description:'In the highly anticipated Thinking, Fast and Slow, Kahneman takes us on a groundbreaking tour of the mind and explains the two systems that drive the way we think.' },
    { id:'b016', title:'Rich Dad Poor Dad', author:'Robert T. Kiyosaki', isbn:'978-1-61268-110-7', category:'Finance', price:15.99, originalPrice:19.99, rating:4.4, reviewCount:9876, stock:70, pages:336, publisher:'Plata Publishing', language:'English', publishYear:1997, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg', description:"Rich Dad Poor Dad is Robert's story of growing up with two dads — his real father and the father of his best friend, his \"rich dad\" — and the ways in which both men shaped his thoughts about money and investing." },
    { id:'b017', title:'A Brief History of Time', author:'Stephen Hawking', isbn:'978-0-553-38016-3', category:'Science', price:16.99, originalPrice:21.99, rating:4.7, reviewCount:5412, stock:55, pages:212, publisher:'Bantam Books', language:'English', publishYear:1988, featured:false, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg', description:"A landmark volume in science writing by one of the great minds of our time, Stephen Hawking's book explores such profound questions as: How did the universe begin—and what made its start possible? Does time always flow forward?" },
    { id:'b018', title:'The Da Vinci Code', author:'Dan Brown', isbn:'978-0-307-47427-8', category:'Thriller', price:14.99, originalPrice:18.99, rating:4.3, reviewCount:11234, stock:60, pages:454, publisher:'Doubleday', language:'English', publishYear:2003, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg', description:'Harvard professor Robert Langdon receives an urgent late-night phone call: the elderly curator of the Louvre has been murdered inside the museum, his body covered in baffling symbols. Langdon and a gifted French cryptologist team up in a thrilling quest.' },
    { id:'b019', title:'The Power of Now', author:'Eckhart Tolle', isbn:'978-1-57731-480-6', category:'Self-Help', price:14.99, originalPrice:18.99, rating:4.5, reviewCount:8341, stock:52, pages:236, publisher:'New World Library', language:'English', publishYear:1997, featured:false, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9781577314806-L.jpg', description:"The #1 New York Times bestseller. Eckhart Tolle's message is simple: living in the now is the truest path to happiness and enlightenment." },
    { id:'b020', title:'The Subtle Art of Not Giving a F*ck', author:'Mark Manson', isbn:'978-0-06-245773-5', category:'Self-Help', price:15.99, originalPrice:21.99, rating:4.4, reviewCount:10234, stock:65, pages:224, publisher:'HarperOne', language:'English', publishYear:2016, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780062457738-L.jpg', description:'In this generation-defining self-help guide, a superstar blogger cuts through the crap to show us how to stop trying to be "positive" all the time so that we can truly become better, happier people.' },
    { id:'b021', title:'The Hunger Games', author:'Suzanne Collins', isbn:'978-0-439-02348-1', category:'Dystopian', price:14.99, originalPrice:19.99, rating:4.7, reviewCount:13456, stock:58, pages:374, publisher:'Scholastic Press', language:'English', publishYear:2008, featured:true, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780439023481-L.jpg', description:'In the ruins of a place once known as North America lies the nation of Panem, a shining Capitol surrounded by twelve outlying districts. The Capitol is harsh and cruel and keeps the districts in line by forcing them all to send one boy and one girl to compete in the Hunger Games.' },
    { id:'b022', title:'Gone Girl', author:'Gillian Flynn', isbn:'978-0-307-58837-1', category:'Thriller', price:15.99, originalPrice:19.99, rating:4.2, reviewCount:7823, stock:44, pages:422, publisher:'Crown Publishers', language:'English', publishYear:2012, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780307588371-L.jpg', description:'On a warm summer morning in North Carthage, Missouri, it is Nick and Amy Dunne\'s fifth wedding anniversary. Presents are being unwrapped, champagne is being poured, and music is playing. But all is not celebration in the Dunne household.' },
    { id:'b023', title:'The Catcher in the Rye', author:'J.D. Salinger', isbn:'978-0-316-76948-0', category:'Fiction', price:12.99, originalPrice:15.99, rating:4.2, reviewCount:6234, stock:38, pages:277, publisher:'Little, Brown and Company', language:'English', publishYear:1951, featured:false, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780316769174-L.jpg', description:"The hero-narrator of The Catcher in the Rye is an ancient child of sixteen, a native New Yorker named Holden Caulfield. Through circumstances that tend to preclude adult, secondhand description, he leaves his prep school in Pennsylvania and goes underground in New York City." },
    { id:'b024', title:'Educated', author:'Tara Westover', isbn:'978-0-399-59050-4', category:'Biography', price:16.99, originalPrice:22.99, rating:4.7, reviewCount:8923, stock:42, pages:334, publisher:'Random House', language:'English', publishYear:2018, featured:true, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg', description:'Born to survivalists in the mountains of Idaho, Tara Westover was seventeen the first time she set foot in a classroom. Her family was so isolated from mainstream society that there was no one to ensure she received an education.' },
    { id:'b025', title:'Becoming', author:'Michelle Obama', isbn:'978-1-5247-6313-8', category:'Biography', price:19.99, originalPrice:28.99, rating:4.8, reviewCount:12341, stock:50, pages:426, publisher:'Crown', language:'English', publishYear:2018, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9781524763138-L.jpg', description:'In her memoir, a work of deep reflection and mesmerizing storytelling, Michelle Obama invites readers into her world, chronicling the experiences that have shaped her—from her childhood on the South Side of Chicago to her years as an executive balancing the demands of motherhood and work.' },
    { id:'b026', title:'The Kite Runner', author:'Khaled Hosseini', isbn:'978-1-59448-000-3', category:'Fiction', price:14.99, originalPrice:18.99, rating:4.7, reviewCount:9456, stock:47, pages:372, publisher:'Riverhead Books', language:'English', publishYear:2003, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9781594480003-L.jpg', description:'The unforgettable, heartbreaking story of the unlikely friendship between a wealthy boy and the son of his father\'s servant, caught in the tragic sweep of history, The Kite Runner transports readers to Afghanistan before and after the fall of the Soviet-supported government.' },
    { id:'b027', title:'It Ends with Us', author:'Colleen Hoover', isbn:'978-1-5011-1036-8', category:'Romance', price:15.99, originalPrice:19.99, rating:4.6, reviewCount:18342, stock:72, pages:385, publisher:'Atria Books', language:'English', publishYear:2016, featured:true, bestseller:true, newArrival:true, coverUrl:'https://covers.openlibrary.org/b/isbn/9781501110368-L.jpg', description:'Lily hasn\'t always had it easy, but that\'s never stopped her from working hard for the life she wants. She\'s come a long way from the small town in Maine where she grew up—she graduated from college, moved to Boston, and started her own business.' },
    { id:'b028', title:'The Psychology of Money', author:'Morgan Housel', isbn:'978-0-857-19763-9', category:'Finance', price:17.99, originalPrice:22.99, rating:4.7, reviewCount:14231, stock:68, pages:256, publisher:'Harriman House', language:'English', publishYear:2020, featured:true, bestseller:true, newArrival:true, coverUrl:'https://covers.openlibrary.org/b/isbn/9780857197634-L.jpg', description:'Timeless lessons on wealth, greed, and happiness doing well with money isn\'t necessarily about what you know. It\'s about how you behave. And behavior is hard to teach, even to really smart people.' },
    { id:'b029', title:'The 48 Laws of Power', author:'Robert Greene', isbn:'978-0-670-88146-6', category:'Psychology', price:19.99, originalPrice:27.99, rating:4.4, reviewCount:8234, stock:55, pages:452, publisher:'Viking', language:'English', publishYear:1998, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780670881468-L.jpg', description:'Amoral, cunning, ruthless, and instructive, this multi-million-copy New York Times bestseller is the definitive manual for anyone interested in gaining, observing, or defending against ultimate control.' },
    { id:'b030', title:'Meditations', author:'Marcus Aurelius', isbn:'978-0-14-044140-6', category:'Philosophy', price:11.99, originalPrice:14.99, rating:4.8, reviewCount:6823, stock:60, pages:254, publisher:'Penguin Classics', language:'English', publishYear:1558, featured:false, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780140441406-L.jpg', description:'Written in Greek by an intellectual Roman emperor without any intention of publication, the Meditations of Marcus Aurelius offer a remarkable series of challenging spiritual reflections and exercises.' },
    { id:'b031', title:'The Hobbit', author:'J.R.R. Tolkien', isbn:'978-0-547-92822-7', category:'Fantasy', price:14.99, originalPrice:18.99, rating:4.8, reviewCount:11234, stock:62, pages:310, publisher:'Houghton Mifflin', language:'English', publishYear:1937, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg', description:'In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.' },
    { id:'b032', title:'The Book Thief', author:'Markus Zusak', isbn:'978-0-375-83100-3', category:'Fiction', price:14.99, originalPrice:18.99, rating:4.7, reviewCount:9012, stock:43, pages:550, publisher:'Knopf', language:'English', publishYear:2005, featured:false, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780375831003-L.jpg', description:'It is 1939. Nazi Germany. The country is holding its breath. Death has never been busier, and will be busier still. Liesel Meminger is a foster girl living outside of Munich. When she arrived at her new home, she stole her first book—The Grave Digger\'s Handbook—left behind in the snow.' },
    { id:'b033', title:'Shoe Dog', author:'Phil Knight', isbn:'978-1-5011-0276-9', category:'Biography', price:17.99, originalPrice:23.99, rating:4.7, reviewCount:7823, stock:38, pages:386, publisher:'Scribner', language:'English', publishYear:2016, featured:false, bestseller:true, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9781501102769-L.jpg', description:'In this candid and riveting memoir, for the first time ever, Nike founder and CEO Phil Knight shares the inside story of the company\'s early days as an intrepid start-up and its evolution into one of the world\'s most iconic, game-changing, and profitable brands.' },
    { id:'b034', title:'Ikigai', author:'Héctor García & Francesc Miralles', isbn:'978-0-143-13021-3', category:'Self-Help', price:13.99, originalPrice:17.99, rating:4.5, reviewCount:10123, stock:73, pages:208, publisher:'Penguin Life', language:'English', publishYear:2016, featured:false, bestseller:true, newArrival:true, coverUrl:'https://covers.openlibrary.org/b/isbn/9780143130215-L.jpg', description:'According to the Japanese, everyone has an ikigai—a reason for living. And according to the residents of the Japanese village with the world\'s longest-living people, finding it is the key to a longer and more fulfilling life.' },
    { id:'b035', title:'The Lean Startup', author:'Eric Ries', isbn:'978-0-307-88791-7', category:'Finance', price:18.99, originalPrice:24.99, rating:4.5, reviewCount:6234, stock:45, pages:336, publisher:'Crown Business', language:'English', publishYear:2011, featured:false, bestseller:false, newArrival:false, coverUrl:'https://covers.openlibrary.org/b/isbn/9780307887917-L.jpg', description:'The Lean Startup offers entrepreneurs—in companies of all sizes—a way to test their vision continuously, to adapt and adjust before it\'s too late. Ries provides a scientific approach to creating and managing successful startups in an age when companies need to innovate more than ever.' },
  ];

  const SEED_MARKETPLACE = [
    { id:'m001', sellerId:'u002', title:"Harry Potter and the Sorcerer's Stone", author:'J.K. Rowling', isbn:'978-0-439-70818-8', category:'Fantasy', condition:'Like New', price:8.99, originalPrice:19.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9780439708180-L.jpg', description:'Barely read, spine in perfect condition. A few pencil marks inside that can be erased. Great deal!', status:'active', createdAt:'2026-06-10T09:00:00Z', images:[], viewCount:124 },
    { id:'m002', sellerId:'u003', title:'1984', author:'George Orwell', isbn:'978-0-452-28423-4', category:'Dystopian', condition:'Good', price:6.99, originalPrice:11.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg', description:'Good condition with some highlighting on a few pages. All text is readable. Great for students.', status:'active', createdAt:'2026-06-12T14:30:00Z', images:[], viewCount:89 },
    { id:'m003', sellerId:'u002', title:'Atomic Habits', author:'James Clear', isbn:'978-0-7352-1129-2', category:'Self-Help', condition:'New', price:13.50, originalPrice:15.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg', description:'Bought as a gift but already had one. Sealed in original packaging. Best deal you\'ll find!', status:'active', createdAt:'2026-06-14T11:00:00Z', images:[], viewCount:213 },
    { id:'m004', sellerId:'u004', title:'Sapiens', author:'Yuval Noah Harari', isbn:'978-0-06-231609-7', category:'History', condition:'Good', price:9.99, originalPrice:18.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9780062316110-L.jpg', description:'Read once, very good condition. No notes or highlights. A fascinating read.', status:'active', createdAt:'2026-06-15T16:00:00Z', images:[], viewCount:67 },
    { id:'m005', sellerId:'u003', title:'Dune', author:'Frank Herbert', isbn:'978-0-441-17271-9', category:'Sci-Fi', condition:'Like New', price:11.99, originalPrice:16.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9780441013593-L.jpg', description:'Excellent condition. Read with care. The pages are slightly yellowed but overall very good.', status:'active', createdAt:'2026-06-16T08:00:00Z', images:[], viewCount:145 },
    { id:'m006', sellerId:'u005', title:'The Alchemist', author:'Paulo Coelho', isbn:'978-0-06-112241-5', category:'Fiction', condition:'Fair', price:4.99, originalPrice:13.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg', description:'Shows wear on cover. Some pages dog-eared. All text readable. A timeless classic at a great price!', status:'active', createdAt:'2026-06-17T12:00:00Z', images:[], viewCount:92 },
    { id:'m007', sellerId:'u004', title:'Thinking, Fast and Slow', author:'Daniel Kahneman', isbn:'978-0-374-27563-1', category:'Psychology', condition:'Good', price:12.00, originalPrice:19.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg', description:'Used for a psychology course. Some highlighting in chapter 1-3. Otherwise excellent condition.', status:'active', createdAt:'2026-06-18T09:30:00Z', images:[], viewCount:58 },
    { id:'m008', sellerId:'u005', title:'Rich Dad Poor Dad', author:'Robert T. Kiyosaki', isbn:'978-1-61268-110-7', category:'Finance', condition:'New', price:14.00, originalPrice:15.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9781612680194-L.jpg', description:'Unopened. Received as a gift. Selling as I already own a copy.', status:'active', createdAt:'2026-06-19T15:00:00Z', images:[], viewCount:178 },
    { id:'m009', sellerId:'u002', title:'The Lord of the Rings', author:'J.R.R. Tolkien', isbn:'978-0-618-57494-1', category:'Fantasy', condition:'Good', price:18.00, originalPrice:24.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9780618640157-L.jpg', description:'Complete trilogy in one volume. Good condition. Cover has minor scuffs. Perfect for Tolkien fans.', status:'active', createdAt:'2026-06-20T11:00:00Z', images:[], viewCount:203 },
    { id:'m010', sellerId:'u003', title:'A Brief History of Time', author:'Stephen Hawking', isbn:'978-0-553-38016-3', category:'Science', condition:'Like New', price:10.50, originalPrice:16.99, coverUrl:'https://covers.openlibrary.org/b/isbn/9780553380163-L.jpg', description:'Nearly perfect condition. Only read once. A must-have for science enthusiasts.', status:'active', createdAt:'2026-06-21T08:00:00Z', images:[], viewCount:41 },
  ];

  const SEED_USERS = [
    { id:'u001', name:'Admin User', email:'admin@bookverse.com', password:'admin123', role:'admin', avatar:'A', bio:'Platform administrator', joinDate:'2025-01-01T00:00:00Z', isBanned:false, sellerRating:5, totalSales:0 },
    { id:'u002', name:'Sarah Johnson', email:'sarah@example.com', password:'pass123', role:'seller', avatar:'S', bio:'Book lover and avid reader. Selling my collection of well-loved books.', joinDate:'2025-03-15T00:00:00Z', isBanned:false, sellerRating:4.8, totalSales:47 },
    { id:'u003', name:'Mike Chen', email:'mike@example.com', password:'pass123', role:'seller', avatar:'M', bio:'Student selling textbooks and fiction. Fast shipper!', joinDate:'2025-04-20T00:00:00Z', isBanned:false, sellerRating:4.5, totalSales:23 },
    { id:'u004', name:'Emily Davis', email:'emily@example.com', password:'pass123', role:'buyer', avatar:'E', bio:'Passionate reader exploring different genres.', joinDate:'2025-06-01T00:00:00Z', isBanned:false, sellerRating:4.7, totalSales:12 },
    { id:'u005', name:'John Smith', email:'john@example.com', password:'pass123', role:'seller', avatar:'J', bio:'Book collector downsizing my library. All books in great condition.', joinDate:'2025-07-10T00:00:00Z', isBanned:false, sellerRating:4.6, totalSales:31 },
  ];

  const SEED_REVIEWS = [
    { id:'r001', bookId:'b009', userId:'u004', rating:5, text:'Absolutely magical! Harry Potter never gets old. The world-building is incredible and the characters feel so real. I\'ve read this at least 5 times now.', createdAt:'2026-05-10T10:00:00Z', helpful:42 },
    { id:'r002', bookId:'b007', userId:'u003', rating:5, text:'This book completely changed how I approach my daily habits. The concept of the 1% improvement is so simple yet so powerful. Highly recommend to everyone!', createdAt:'2026-05-15T14:00:00Z', helpful:38 },
    { id:'r003', bookId:'b003', userId:'u002', rating:5, text:'A timeless masterpiece. Orwell\'s vision is frightening and feels increasingly relevant today. Everyone should read this at least once.', createdAt:'2026-05-20T09:00:00Z', helpful:56 },
    { id:'r004', bookId:'b006', userId:'u004', rating:4, text:'Fascinating overview of human history. Some parts can be a bit dense but the insights are worth it. Changed my perspective on civilization.', createdAt:'2026-06-01T11:00:00Z', helpful:29 },
    { id:'r005', bookId:'b014', userId:'u003', rating:5, text:'One of the best sci-fi books I\'ve ever read. The mystery, the science, the alien encounter — all perfect. Couldn\'t put it down!', createdAt:'2026-06-10T15:00:00Z', helpful:67 },
    { id:'r006', bookId:'b001', userId:'u005', rating:4, text:'A classic American novel with beautiful prose. The themes of wealth, class, and the American Dream are still relevant. Short but profound.', createdAt:'2026-06-12T08:00:00Z', helpful:21 },
    { id:'r007', bookId:'b002', userId:'u004', rating:5, text:'One of the greatest American novels ever written. Lee\'s portrayal of racial injustice through a child\'s eyes is both heartbreaking and uplifting.', createdAt:'2026-06-14T12:00:00Z', helpful:44 },
    { id:'r008', bookId:'b010', userId:'u002', rating:5, text:'The most immersive fantasy world ever created. Tolkien\'s attention to detail is unparalleled. A journey that stays with you forever.', createdAt:'2026-06-18T16:00:00Z', helpful:73 },
  ];

  const SEED_NOTIFICATIONS = [
    { id:'n001', userId:'u004', type:'order', message:'Your order #ORD-001 has been shipped!', read:false, createdAt:'2026-06-21T08:00:00Z', icon:'📦' },
    { id:'n002', userId:'u004', type:'review', message:'Someone found your review helpful!', read:false, createdAt:'2026-06-20T14:00:00Z', icon:'👍' },
    { id:'n003', userId:'u004', type:'wishlist', message:'A book on your wishlist is now on sale!', read:true, createdAt:'2026-06-19T10:00:00Z', icon:'❤️' },
  ];

  const SEED_ORDERS = [
    { id:'ORD-001', userId:'u004', items:[{bookId:'b007', source:'store', quantity:1, price:15.99, title:'Atomic Habits'},{bookId:'b014', source:'store', quantity:1, price:17.99, title:'Project Hail Mary'}], total:36.98, status:'shipped', createdAt:'2026-06-18T10:00:00Z', shippingAddress:{name:'Emily Davis', street:'123 Main St', city:'New York', state:'NY', zip:'10001', country:'US'}, paymentMethod:'razorpay', trackingNumber:'BV123456789' },
    { id:'ORD-002', userId:'u004', items:[{bookId:'b009', source:'store', quantity:1, price:19.99, title:"Harry Potter and the Sorcerer's Stone"}], total:21.99, status:'delivered', createdAt:'2026-06-05T12:00:00Z', shippingAddress:{name:'Emily Davis', street:'123 Main St', city:'New York', state:'NY', zip:'10001', country:'US'}, paymentMethod:'cod', trackingNumber:'BV987654321' },
  ];

  /* ─────────────────────────────────────────
     Helper
  ───────────────────────────────────────── */
  const get = (key, fallback=null) => {
    try {
      const v = localStorage.getItem('bv_'+key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  };

  const set = (key, val) => {
    try { localStorage.setItem('bv_'+key, JSON.stringify(val)); } catch {}
  };

  const init = () => {
    if (get('dataVersion') !== '2') {
      set('users',             SEED_USERS);
      set('storeBooks',        SEED_BOOKS);
      set('marketplaceListings', SEED_MARKETPLACE);
      set('reviews',           SEED_REVIEWS);
      set('orders',            SEED_ORDERS);
      set('notifications',     SEED_NOTIFICATIONS);
      set('cart',              []);
      set('wishlist',          []);
      set('session',           null);
      set('dataVersion',       '2');
      set('initialized',       true);
    }
  };

  /* ─────────────────────────────────────────
     Book gradient helper
  ───────────────────────────────────────── */
  const getBookGradient = (category) => {
    const colors = CATEGORY_GRADIENTS[category] || ['#667eea','#764ba2'];
    return `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`;
  };

  /* ─────────────────────────────────────────
     Public API
  ───────────────────────────────────────── */

  // SESSION
  const getSession = () => get('session');
  const setSession = (user) => set('session', user);
  const clearSession = () => set('session', null);

  // USERS
  const getUsers = () => get('users', []);
  const setUsers = (users) => set('users', users);
  const getUserById = (id) => getUsers().find(u => u.id === id);
  const updateUser = (id, changes) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx !== -1) { users[idx] = {...users[idx], ...changes}; setUsers(users); return users[idx]; }
    return null;
  };
  const addUser = (user) => {
    const users = getUsers();
    users.push(user);
    setUsers(users);
    return user;
  };

  // STORE BOOKS
  const getStoreBooks = () => get('storeBooks', []);
  const setStoreBooks = (books) => set('storeBooks', books);
  const getStoreBookById = (id) => getStoreBooks().find(b => b.id === id);
  const addStoreBook = (book) => {
    const books = getStoreBooks();
    const newBook = { ...book, id: 'b' + String(Date.now()).slice(-6) };
    books.push(newBook);
    setStoreBooks(books);
    return newBook;
  };
  const updateStoreBook = (id, changes) => {
    const books = getStoreBooks();
    const idx = books.findIndex(b => b.id === id);
    if (idx !== -1) { books[idx] = {...books[idx], ...changes}; setStoreBooks(books); return books[idx]; }
    return null;
  };
  const deleteStoreBook = (id) => {
    const books = getStoreBooks().filter(b => b.id !== id);
    setStoreBooks(books);
  };

  // MARKETPLACE
  const getListings = () => get('marketplaceListings', []);
  const setListings = (items) => set('marketplaceListings', items);
  const getListingById = (id) => getListings().find(l => l.id === id);
  const addListing = (listing) => {
    const listings = getListings();
    const newListing = { ...listing, id: 'm' + String(Date.now()).slice(-6), createdAt: new Date().toISOString(), viewCount: 0 };
    listings.push(newListing);
    setListings(listings);
    return newListing;
  };
  const updateListing = (id, changes) => {
    const listings = getListings();
    const idx = listings.findIndex(l => l.id === id);
    if (idx !== -1) { listings[idx] = {...listings[idx], ...changes}; setListings(listings); return listings[idx]; }
    return null;
  };
  const deleteListing = (id) => {
    const listings = getListings().filter(l => l.id !== id);
    setListings(listings);
  };

  // CART
  const getCart = () => get('cart', []);
  const setCart = (items) => set('cart', items);
  const addToCart = (item) => {
    const cart = getCart();
    const existing = cart.find(c => c.bookId === item.bookId && c.source === item.source);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ ...item, quantity: item.quantity || 1 });
    }
    setCart(cart);
    updateCartBadge();
  };
  const removeFromCart = (bookId, source) => {
    const cart = getCart().filter(c => !(c.bookId === bookId && c.source === source));
    setCart(cart);
    updateCartBadge();
  };
  const updateCartQty = (bookId, source, qty) => {
    const cart = getCart();
    const item = cart.find(c => c.bookId === bookId && c.source === source);
    if (item) { item.quantity = Math.max(1, qty); setCart(cart); }
    updateCartBadge();
  };
  const clearCart = () => { setCart([]); updateCartBadge(); };
  const getCartTotal = () => getCart().reduce((sum, item) => sum + (item.price * (item.quantity||1)), 0);
  const getCartCount = () => getCart().reduce((sum, item) => sum + (item.quantity||1), 0);
  const updateCartBadge = () => {
    const el = document.getElementById('cart-count');
    if (el) { el.textContent = getCartCount(); el.style.display = getCartCount() > 0 ? 'flex' : 'none'; }
  };

  // WISHLIST
  const getWishlist = () => get('wishlist', []);
  const setWishlist = (items) => set('wishlist', items);
  const addToWishlist = (bookId) => {
    const wl = getWishlist();
    if (!wl.includes(bookId)) { wl.push(bookId); setWishlist(wl); }
    updateWishlistBadge();
  };
  const removeFromWishlist = (bookId) => {
    setWishlist(getWishlist().filter(id => id !== bookId));
    updateWishlistBadge();
  };
  const isInWishlist = (bookId) => getWishlist().includes(bookId);
  const toggleWishlist = (bookId) => {
    if (isInWishlist(bookId)) { removeFromWishlist(bookId); return false; }
    else { addToWishlist(bookId); return true; }
  };
  const updateWishlistBadge = () => {
    const el = document.getElementById('wishlist-count');
    const count = getWishlist().length;
    if (el) { el.textContent = count; el.style.display = count > 0 ? 'flex' : 'none'; }
  };

  // REVIEWS
  const getReviews = () => get('reviews', []);
  const getBookReviews = (bookId) => getReviews().filter(r => r.bookId === bookId);
  const addReview = (review) => {
    const reviews = getReviews();
    const newReview = { ...review, id: 'r' + String(Date.now()).slice(-6), createdAt: new Date().toISOString(), helpful: 0 };
    reviews.push(newReview);
    set('reviews', reviews);
    // Update book rating
    const bookReviews = reviews.filter(r => r.bookId === review.bookId);
    const avgRating = bookReviews.reduce((sum, r) => sum + r.rating, 0) / bookReviews.length;
    updateStoreBook(review.bookId, { rating: Math.round(avgRating*10)/10, reviewCount: bookReviews.length });
    return newReview;
  };
  const markHelpful = (reviewId) => {
    const reviews = getReviews();
    const r = reviews.find(r => r.id === reviewId);
    if (r) { r.helpful = (r.helpful || 0) + 1; set('reviews', reviews); }
  };

  // ORDERS
  const getOrders = () => get('orders', []);
  const getUserOrders = (userId) => getOrders().filter(o => o.userId === userId);
  const placeOrder = (orderData) => {
    const orders = getOrders();
    const order = { ...orderData, id: 'ORD-' + String(Date.now()).slice(-6), createdAt: new Date().toISOString(), status: 'confirmed' };
    orders.push(order);
    set('orders', orders);
    clearCart();
    addNotification({ userId: orderData.userId, type: 'order', message: `Your order ${order.id} has been placed successfully!`, icon: '🎉' });
    return order;
  };
  const updateOrderStatus = (orderId, status) => {
    const orders = getOrders();
    const o = orders.find(o => o.id === orderId);
    if (o) { o.status = status; set('orders', orders); }
  };

  // NOTIFICATIONS
  const getNotifications = () => get('notifications', []);
  const getUserNotifications = (userId) => getNotifications().filter(n => n.userId === userId);
  const getUnreadCount = (userId) => getUserNotifications(userId).filter(n => !n.read).length;
  const addNotification = (notif) => {
    const notifs = getNotifications();
    notifs.unshift({ ...notif, id: 'n' + String(Date.now()).slice(-6), createdAt: new Date().toISOString(), read: false });
    set('notifications', notifs.slice(0, 50));
    updateNotifBadge();
  };
  const markNotifRead = (id) => {
    const notifs = getNotifications();
    const n = notifs.find(n => n.id === id);
    if (n) { n.read = true; set('notifications', notifs); updateNotifBadge(); }
  };
  const markAllNotifRead = (userId) => {
    const notifs = getNotifications().map(n => n.userId === userId ? {...n, read:true} : n);
    set('notifications', notifs);
    updateNotifBadge();
  };
  const updateNotifBadge = () => {
    const session = getSession();
    if (!session) return;
    const count = getUnreadCount(session.id);
    const badge = document.getElementById('notif-badge');
    if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'flex' : 'none'; }
  };

  // SEARCH
  const searchBooks = (query, filters = {}) => {
    let books = getStoreBooks();
    const q = query?.toLowerCase().trim() || '';

    if (q) {
      books = books.filter(b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q)
      );
    }
    if (filters.category) books = books.filter(b => b.category === filters.category);
    if (filters.minPrice != null) books = books.filter(b => b.price >= filters.minPrice);
    if (filters.maxPrice != null) books = books.filter(b => b.price <= filters.maxPrice);
    if (filters.minRating != null) books = books.filter(b => b.rating >= filters.minRating);
    if (filters.inStock) books = books.filter(b => b.stock > 0);

    if (filters.sort === 'price-asc')  books.sort((a,b) => a.price - b.price);
    if (filters.sort === 'price-desc') books.sort((a,b) => b.price - a.price);
    if (filters.sort === 'rating')     books.sort((a,b) => b.rating - a.rating);
    if (filters.sort === 'newest')     books.sort((a,b) => b.publishYear - a.publishYear);
    if (filters.sort === 'popular')    books.sort((a,b) => b.reviewCount - a.reviewCount);

    return books;
  };

  const searchMarketplace = (query, filters = {}) => {
    let listings = getListings().filter(l => l.status === 'active');
    const q = query?.toLowerCase().trim() || '';

    if (q) {
      listings = listings.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.author.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q)
      );
    }
    if (filters.category)  listings = listings.filter(l => l.category === filters.category);
    if (filters.condition) listings = listings.filter(l => l.condition === filters.condition);
    if (filters.minPrice != null) listings = listings.filter(l => l.price >= filters.minPrice);
    if (filters.maxPrice != null) listings = listings.filter(l => l.price <= filters.maxPrice);

    if (filters.sort === 'price-asc')  listings.sort((a,b) => a.price - b.price);
    if (filters.sort === 'price-desc') listings.sort((a,b) => b.price - a.price);
    if (filters.sort === 'newest')     listings.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (filters.sort === 'popular')    listings.sort((a,b) => (b.viewCount||0) - (a.viewCount||0));

    return listings;
  };

  // CATEGORIES
  const getCategories = () => {
    const books = getStoreBooks();
    const cats = {};
    books.forEach(b => { cats[b.category] = (cats[b.category]||0) + 1; });
    return Object.entries(cats).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
  };

  const CATEGORY_ICONS = {
    'Fiction':'📖', 'Sci-Fi':'🚀', 'Fantasy':'🧙', 'Dystopian':'🌑',
    'Romance':'💕', 'History':'🏛️', 'Self-Help':'💪', 'Psychology':'🧠',
    'Finance':'💰', 'Science':'🔬', 'Thriller':'🔪', 'Biography':'👤',
    'Children':'🌈', 'Non-Fiction':'📰', 'Philosophy':'🤔',
  };

  return {
    init,
    getBookGradient,
    CATEGORY_GRADIENTS,
    CATEGORY_ICONS,
    // Session
    getSession, setSession, clearSession,
    // Users
    getUsers, getUserById, updateUser, addUser,
    // Store
    getStoreBooks, getStoreBookById, addStoreBook, updateStoreBook, deleteStoreBook,
    // Marketplace
    getListings, getListingById, addListing, updateListing, deleteListing,
    // Cart
    getCart, addToCart, removeFromCart, updateCartQty, clearCart, getCartTotal, getCartCount, updateCartBadge,
    // Wishlist
    getWishlist, addToWishlist, removeFromWishlist, isInWishlist, toggleWishlist, updateWishlistBadge,
    // Reviews
    getReviews, getBookReviews, addReview, markHelpful,
    // Orders
    getOrders, getUserOrders, placeOrder, updateOrderStatus,
    // Notifications
    getNotifications, getUserNotifications, getUnreadCount, addNotification, markNotifRead, markAllNotifRead, updateNotifBadge,
    // Search
    searchBooks, searchMarketplace,
    // Categories
    getCategories, CATEGORY_ICONS,
  };
})();
