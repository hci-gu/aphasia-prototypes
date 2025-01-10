const foodInviteEmail = () => {
  const today = new Date()
  let nextSaturday = new Date()
  nextSaturday.setDate(today.getDate() + ((6 - today.getDay()) % 7) + 1)
  const nextSaturdayString = nextSaturday.toLocaleDateString('sv-SE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return `
Hej,

Vi vill gärna bjuda in dig till ett födelsedagsfirande som vi planerar att hålla nästa helg, och vi hoppas att du kan vara med och fira!

Här är detaljerna för firandet: ${nextSaturdayString} kl. 18:00 På Restaurang Måltiden, Centrala Gatan 12

För att göra det extra speciellt vill vi att du väljer din favoritmat från restaurangens meny i förväg, så vi kan säkerställa att alla får njuta av något de gillar. Skicka gärna tillbaka med din matpreferens från menyn nedan, så ordnar vi det åt dig:

Alternativ 1: Grillad lax med potatisgratäng och sallad
Alternativ 2: Vegetarisk pasta med svamp och spenat
Alternativ 3: Hamburgare med pommes och tillbehör
Om ingen av dessa rätter tilltalar dig, hör av dig så hittar vi ett alternativ!

Vi ser fram emot en rolig kväll och hoppas du kan vara med och fira!

Hör gärna av dig om du har några frågor.

Med vänliga hälsningar,
Anna
    `
}

const aphasiaMeetingInvite = () => {
  const today = new Date()
  const nextWednesday = new Date()
  const startOfNextWeek = new Date()
  startOfNextWeek.setDate(today.getDate() + ((7 - today.getDay()) % 7))
  nextWednesday.setDate(startOfNextWeek.getDate() + 3)

  const nextWednesdayString = nextWednesday.toLocaleDateString('sv-SE', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return `Hej!

Hoppas att allt är bra med dig!

Tiden går snabbt och nu är det snart dags för det moment på logopedprogrammet där du har varit med några gånger och berättat om hur det är att ha afasi.

Har du möjlighet att vara med?

Nästa vecka, ${nextWednesdayString}, kl 10.15-13.00.

Hoppas att du kan!

Med vänlig hälsning

Ingrid
  `
}

export const EMAILS = [
  {
    id: 1,
    subject: 'Viktigt meddelande',
    body: 'Hej, jag har en viktig fråga till dig. Kan du ringa mig?',
    from: 'Anders',
  },
  {
    id: 2,
    subject: 'Middags val för fest',
    body: foodInviteEmail(),
    from: 'Anna',
  },
  {
    id: 3,
    subject: 'Nycklar',
    body: `Hej,
jag har hittat dina nycklar, skulle du kunna svara med din adress så jag kan posta dem till dig?`,
    from: 'Bertil',
  },
  {
    id: 4,
    subject: 'Födelsedagsfest',
    body: `Hej,

jag fyller år nästa vecka och tänkte ha en fest. Hoppas du kan komma!
`,
    from: 'Cecilia',
  },
  {
    id: 5,
    subject: 'Möte nästa vecka',
    body: `
Hej, 

Jag vill boka in ett möte med dig för att diskutera ett nytt projekt. Hur ser det ut för dig nästa vecka? Skulle du kunna återkomma med några förslag på dagar och tider som passar dig?
    `,
    from: 'David',
  },
  {
    id: 6,
    subject: 'Angående förstudien om generativ AI och skrivstöd',
    body: `
Hej!

Hoppas bra med dig! Hur har det gått med förstudien om generativ AI och skrivstöd? Jag sitter och planerar för Tidningen Afasi och undrar om du tror att du skulle kunna skriva en artikel om arbetet till nummer 1/2025 (manusstopp 12 februari 2025) eller nummer 2/2025 (manusstopp 7 april 2025)?

Allt gott!

Vänliga hälsningar`,
    from: 'Elin',
  },
  {
    id: 7,
    subject: 'Medverkan i Logopedprogrammet',
    body: aphasiaMeetingInvite(),
    from: 'Ingrid',
  },
  {
    id: 8,
    subject: 'Avslutning av vikariat',
    body: `
Hej goa PIL:are, Vid nyår slutar Jeff sitt vikariat på PIL. Vi kommer tacka av honom på julbordet den 11 december.

Jag sköter swish-insamling för en gemensam present. 070-12345

Märk din betalning "Jeff avtackning". Senast 9 dec vill jag ha ditt bidrag men gärna tidigare. Tips om lämplig present tas tacksamt emot (annars blir det bubbel & böcker).

Allt gott`,
    from: 'Karin',
  },
  {
    id: 9,
    subject: 'Försenad inlämning',
    body: `
Hej,

Jag vill meddela att jag idag har svårt att delta fullt ut eftersom jag har lektioner. Jag ska genomföra labben med mina elever i AI 1 och 2, en grupp som startade igår. Detta kommer tyvärr att leda till en försenad inlämning. 

Med vänliga hälsningar
    `,
    from: 'Lennart',
  },
  {
    id: 10,
    subject: 'Låna högtalare',
    body: `
Hej,

Hoppas det är väl med dig!

Kan jag låna den där stora högtalaren/mikrofonen från labbet (som jag lånat en gång tidigare) på torsdag och fredag den här veckan? Jag ordnar en internationell workshop där det kommer vara en del Zoom-presentationer så vi behöver bra in- och utljud för presentation och även frågor från konferensrummet. Vi kommer hålla workshopen på Park Aveny, så om jag skulle kunna hämta högtalaren på onsdag så vore det jättefint.

Vänliga hälsningar
`,
    from: 'Alan',
  },
]
