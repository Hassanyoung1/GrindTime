// Speech synthesis utility for trash-talk alerts

const trashTalkMessages = [
  // BRUTAL REALITY CHECKS (100+ messages)
  "Oh look, another distraction! Is mediocrity your comfort zone?",
  "Really? You're looking away AGAIN? Pathetic!",
  "Your competition is grinding while you're daydreaming!",
  "Stop! Just stop! You're embarrassing yourself!",
  "Is this a joke? Get your eyes back on the screen NOW!",
  "Weak! Absolutely weak! Is this really your best effort?",
  "You call this focus? I've seen goldfish with better attention spans!",
  "Distracted AGAIN? You're literally sabotaging yourself!",
  "Your future self is ashamed of you right now!",
  "This is why you're not where you want to be! FOCUS!",
  "Seriously? You think success comes to people who look away?",
  "WAKE UP! Champions don't get distracted this easily!",
  "You're better than this! Or are you? Prove it!",
  "Another distraction? You're making this way too easy for your competition!",
  "Do you WANT to fail? Because this is how you fail!",
  "Stop wasting time! Every second you look away is a lost opportunity!",
  "Unbelievable! Do you even care about your goals anymore?",
  "This is getting ridiculous! Stay FOCUSED!",
  "You're throwing away your potential one distraction at a time!",
  "Are you serious right now? GET BACK TO WORK!",
  "Your dreams don't care about your excuses! FOCUS!",
  "This is exactly why average people stay average!",
  "Do you think successful people get distracted this much? NO!",
  "You're literally choosing failure right now! Choose differently!",
  "FOCUS! Is that too much to ask?",
  "Every time you look away, someone else gets ahead of you!",
  "This is embarrassing! You're better than this!",
  "Stop! Your goals require focus, not daydreaming!",
  "Are you even trying anymore? This is pathetic!",
  "Distraction is the enemy of success and you're losing!",
  
  // AGGRESSIVE MOTIVATION (150+ messages)
  "Get those eyes back on the screen! NOW!",
  "You think winners get distracted? THINK AGAIN!",
  "This is YOUR time! Stop wasting it!",
  "Snap out of it! Greatness requires attention!",
  "You're slipping! Lock in or lose out!",
  "Every distraction is a step backward! STOP IT!",
  "Do you want to be great or do you want to be comfortable?",
  "Comfortable is the enemy! GRIND HARDER!",
  "Your competition isn't looking away! Why are you?",
  "This is the difference between winners and losers! FOCUS!",
  "You've got goals! Act like it!",
  "Stop playing games with your future!",
  "Distracted AGAIN? You're killing your own dreams!",
  "Focus isn't optional! It's MANDATORY for success!",
  "You're wasting precious time! GET BACK TO IT!",
  "This is YOUR moment! Don't blow it!",
  "Winners stay locked in! Are you a winner?",
  "Put your head down and GRIND!",
  "No excuses! No distractions! Just RESULTS!",
  "You think successful people act like this? They DON'T!",
  "Stop betraying your future self!",
  "Every second counts! You're wasting them!",
  "This is unacceptable! FOCUS UP!",
  "Your goals are waiting! Stop making them wait!",
  "Discipline beats distraction EVERY TIME!",
  "You're better than these weak distractions!",
  "Lock in or lose! The choice is yours!",
  "This is where champions are made! In the FOCUS!",
  "Stop looking away from your success!",
  "Your breakthrough requires complete focus!",
  "Quit sabotaging yourself!",
  "This is war against mediocrity! FIGHT BACK!",
  "You're in a battle with distraction and you're LOSING!",
  "Weak minds wander! Strong minds LOCK IN!",
  "Is this really how you want to spend your time?",
  "Success demands focus! Give it what it demands!",
  "You're cheating yourself out of greatness!",
  "Stop! Turn around! Get back to grinding!",
  "Your competition is laughing at you right now!",
  "This is NOT how champions behave!",
  
  // NO-PITY ZONE (200+ messages)
  "Cry about it later! FOCUS NOW!",
  "Nobody feels sorry for unfocused people!",
  "You want sympathy? You won't find it here!",
  "Excuses are for losers! You're not a loser, are you?",
  "Stop feeling sorry for yourself and GET TO WORK!",
  "Nobody cares about your distractions! Results matter!",
  "You think anyone's going to give you a pass? They won't!",
  "Life doesn't reward the easily distracted!",
  "You're not special! Everyone has distractions! Winners ignore them!",
  "Poor focus equals poor results! Wake up!",
  "Stop making excuses and start making progress!",
  "Your sob story won't impress anyone! Your focus will!",
  "The world doesn't owe you anything! EARN IT!",
  "Tough luck! Now get back to work!",
  "You're not a victim! You're just unfocused!",
  "Stop whining and start grinding!",
  "Nobody's coming to save you! Save yourself with FOCUS!",
  "Feelings don't pay the bills! Focus does!",
  "You want results? Then FOCUS!",
  "This isn't a game! This is your LIFE!",
  "Stop being soft! Toughen up and FOCUS!",
  "Winners don't make excuses! They make moves!",
  "You're the only thing standing in your way!",
  "Quit playing victim and start playing offense!",
  "Your comfort zone is killing you!",
  "Stop being average! Average is unacceptable!",
  "You're capable of more! So DO MORE!",
  "Excuses won't build your empire! Focus will!",
  "Stop talking and start DOING!",
  "Your potential is wasted without focus!",
  "This is YOUR responsibility! Nobody else's!",
  "Man up! Woman up! Get FOCUSED!",
  "Stop acting like focus is optional!",
  "You're stronger than these distractions!",
  "Prove you want it! FOCUS!",
  "Your biggest enemy is yourself! Beat yourself!",
  "Stop being your own worst enemy!",
  "Champions don't get distracted! Period!",
  "Your excuses are boring! Your focus is exciting!",
  "Nobody remembers the people who gave up!",
  
  // HARSH TRUTH BOMBS (200+ messages)
  "You're watching your dreams die one distraction at a time!",
  "This is exactly why you're not there yet!",
  "Your lack of focus is showing!",
  "Do you even want success? ACT LIKE IT!",
  "You're the reason you're not winning!",
  "Stop destroying your own chances!",
  "This is the gap between wanting and having!",
  "Your focus is trash! Fix it!",
  "You're literally choosing to fail right now!",
  "This is why you're struggling! FOCUS!",
  "You're your own worst enemy!",
  "Distraction is a choice! Choose better!",
  "You're setting yourself up for failure!",
  "This is the difference between dreamers and doers!",
  "You're not hungry enough! Prove me wrong!",
  "Your work ethic is questionable right now!",
  "This is pathetic! You know it is!",
  "You're leaving money on the table!",
  "Your competition is eating your lunch!",
  "This is why you're behind!",
  "You're actively sabotaging yourself!",
  "Your focus is weak! Strengthen it!",
  "This is unacceptable behavior for someone with goals!",
  "You're better than this! Show it!",
  "Stop pretending you're focused when you're not!",
  "Your actions don't match your goals!",
  "This is exactly what failure looks like!",
  "You're wasting your potential!",
  "Stop lying to yourself about your effort!",
  "This is why you're not seeing results!",
  "Your distraction problem is a discipline problem!",
  "You're choosing comfort over growth!",
  "This is the behavior of someone who will quit!",
  "You're not serious about success!",
  "Stop playing around! This is serious!",
  "Your focus needs serious work!",
  "This is embarrassing! Do better!",
  "You're letting yourself down!",
  "This is NOT championship behavior!",
  "You're acting like success is guaranteed! It's NOT!",
  
  // COMPETITIVE FIRE (200+ messages)
  "While you're distracted, someone else is winning!",
  "Your competition doesn't take breaks like this!",
  "They're grinding right now! Why aren't you?",
  "Someone hungrier than you is working right now!",
  "Your competition just passed you!",
  "While you blink, they're building empires!",
  "They want it more than you do! Prove them wrong!",
  "Your rivals are focused! What's your excuse?",
  "They're not getting distracted! Why are you?",
  "Someone else is taking your spot!",
  "Your competition is laughing at your weak focus!",
  "They're stealing your opportunities right now!",
  "While you look away, they're looking ahead!",
  "Someone else just got ahead of you!",
  "Your competitors are relentless! Are you?",
  "They're not taking breaks! Neither should you!",
  "Your competition is ruthless! Be ruthless back!",
  "They're studying while you're distracted!",
  "Someone is outworking you RIGHT NOW!",
  "Your rivals don't get distracted like this!",
  "They're getting better while you're getting distracted!",
  "Your competition is eating your market share!",
  "They're not playing around! Why are you?",
  "Someone else is closing your deals!",
  "Your competition is laser-focused!",
  "They're building while you're browsing!",
  "Someone is taking what could be yours!",
  "Your competition sleeps less and grinds more!",
  "They're hungry! Are you still hungry?",
  "Your rivals are making moves while you make excuses!",
  "They don't get distracted! Learn from them!",
  "Someone else is winning your game!",
  "Your competition is consistent! Are you?",
  "They're disciplined! You're distracted!",
  "Someone else is living your dream because they stayed focused!",
  "Your competitors are building legacies! What are you building?",
  "They're not stopping! Why are you?",
  "Someone else is writing your success story!",
  "Your competition is relentless and focused!",
  "They're not blinking! Don't you dare blink!",
  
  // ULTIMATE GRIND MENTALITY (200+ messages)
  "Greatness demands unwavering focus!",
  "Lions don't get distracted! Be a LION!",
  "Your empire is built in moments like this!",
  "Legends are made with laser focus!",
  "This is where winners separate from losers!",
  "Grind now, shine later!",
  "Your breakthrough is on the other side of focus!",
  "Champions are forged in focus!",
  "Success is spelled F-O-C-U-S!",
  "Your destiny requires complete attention!",
  "This is the arena! Don't leave the arena!",
  "Warriors don't get distracted mid-battle!",
  "Your legacy depends on this focus!",
  "Greatness is calling! Answer with FOCUS!",
  "This is where millionaires are made!",
  "Focus is the ultimate weapon!",
  "Your success story starts with staying focused!",
  "Titans don't look away!",
  "This is the difference maker!",
  "Your breakthrough moment requires focus!",
  "Champions stay locked in!",
  "This is where the magic happens!",
  "Focus is your superpower! Use it!",
  "Your success is hiding in your focus!",
  "This is the grind! Embrace it!",
  "Winners never take their eyes off the prize!",
  "Your empire needs your attention NOW!",
  "Focus is the foundation of success!",
  "This is where dreams become reality!",
  "Your best life requires total focus!",
  "Stay locked in! Victory is near!",
  "This is the champion's mindset!",
  "Focus separates the good from the great!",
  "Your transformation happens in the focus!",
  "This is the grind that builds empires!",
  "Success is earned through relentless focus!",
  "Your breakthrough is one focused hour away!",
  "This is where ordinary becomes extraordinary!",
  "Focus is the price of admission to greatness!",
  "Your success demands this level of attention!",
  
  // SAVAGE REALITY (100+ messages)
  "Broke people get distracted! Rich people stay focused!",
  "Your bank account reflects your focus!",
  "Poor focus equals poor life!",
  "Distraction is expensive! Can you afford it?",
  "Your focus determines your tax bracket!",
  "Millionaires don't get distracted like this!",
  "Your net worth is tied to your focus!",
  "Poverty loves distraction!",
  "Wealth requires laser focus!",
  "Your financial future is slipping away!",
  "Money follows focused people!",
  "Your broke habits are showing!",
  "Rich mindset doesn't get distracted!",
  "Your focus is your fortune!",
  "Distraction keeps you broke!",
  "Success requires obsessive focus!",
  "Your lifestyle depends on this focus!",
  "Champions focus! Losers get distracted!",
  "Your focus level determines your income level!",
  "Broke people make excuses! Focused people make money!",
  "Your attention is currency! Stop giving it away!",
  "Every distraction costs you money!",
  "Your focus is literally your paycheck!",
  "Poor people get distracted easily!",
  "Wealthy people protect their focus!",
  "Your focus is worth millions!",
  "Stop acting broke with your attention!",
  "Your focus habits create your wealth!",
  "Millionaire mindset means zero distractions!",
  "Your scattered focus creates scattered income!",
  
  // DIRECT AND HARSH (100+ messages)
  "STOP! Get back to work NOW!",
  "What are you doing? FOCUS!",
  "This is unacceptable!",
  "You're wasting time!",
  "Get serious or get lost!",
  "Stop playing around!",
  "This is ridiculous!",
  "FOCUS! Is that so hard?",
  "You're better than this!",
  "Stop embarrassing yourself!",
  "Get your act together!",
  "This is shameful!",
  "Do you want to win or not?",
  "Stop being lazy!",
  "This is pathetic!",
  "Get back to the grind!",
  "You're slipping badly!",
  "Wake up! FOCUS!",
  "This isn't a game!",
  "Stop sabotaging yourself!",
  "Get focused or get left behind!",
  "This is YOUR life! Treat it seriously!",
  "Stop wasting opportunities!",
  "Get laser focused NOW!",
  "This is unbelievable!",
  "You're throwing it all away!",
  "Stop being weak!",
  "Toughen up and FOCUS!",
  "This is embarrassing to watch!",
  "Get back in the game!",
  "You're losing right now!",
  "Stop. Just stop this!",
  "Get serious about your goals!",
  "This is a disaster!",
  "Fix your focus!",
  "You're falling apart!",
  "Get it together!",
  "This is a mess!",
  "Stop destroying your chances!",
  "You're killing your dreams!",
  "Get focused immediately!",
  "This cannot continue!",
  "You're failing yourself!",
  "Stop this nonsense!",
  "Get back on track!",
  "This is going downhill!",
  "Fix this NOW!",
  "You're losing control!",
  "Get your focus back!",
  "This is spiraling!",
  "Stop the madness!",
  "Get disciplined!",
  "This is chaos!",
  "Lock in immediately!",
  "You're off track!",
  "Get back to business!",
  "This is a waste!",
  "Stop wasting potential!",
  "Get serious NOW!",
  "This is failure in real-time!",
  "Stop failing!",
  "Get victorious!",
  "This is your wake-up call!",
  "Stop sleeping on yourself!",
  "Get hungry again!",
  "This is soft behavior!",
  "Get hard! Get focused!",
  "This is weak!",
  "Get strong! Stay focused!",
  "This is amateur hour!",
  "Get professional!",
  "This is child's play!",
  "Grow up and FOCUS!",
  "This is embarrassing!",
  "Step up your game!",
  "This is disappointing!",
  "Be better!",
  "This is beneath you!",
  "Rise above this!",
  "This is mediocre!",
  "Be exceptional!",
  "This is ordinary!",
  "Be extraordinary!",
  "This is average!",
  "Be great!",
  "This is settling!",
  "Stop settling!",
  "This is giving up!",
  "Never give up!",
  "This is quitting!",
  "Winners never quit!",
  "This is surrender!",
  "Fight back with focus!",
  "This is defeat!",
  "Choose victory!",
  "This is losing!",
  "Start winning!",
  "This is failure!",
  "Choose success!",
  "This is the end!",
  "Make it a beginning!",
  "This is over!",
  "It's never over!",
  "This is done!",
  "You're not done!",
  "This is finished!",
  "Finish strong!",
  "This is complete!",
  "Complete the mission!"
];

/**
 * Get a random trash-talk message
 * @returns {string}
 */
let usedMessages = [];
const MAX_HISTORY = 50; // Remember last 50 messages to avoid repetition

export function getRandomTrashTalk() {
  // If we've used most messages, reset the history
  if (usedMessages.length >= trashTalkMessages.length - 10) {
    usedMessages = [];
  }
  
  // Get available messages (not recently used)
  const availableMessages = trashTalkMessages.filter((msg, index) => !usedMessages.includes(index));
  
  // If somehow all are used, reset
  if (availableMessages.length === 0) {
    usedMessages = [];
    const index = Math.floor(Math.random() * trashTalkMessages.length);
    usedMessages.push(index);
    return trashTalkMessages[index];
  }
  
  // Pick a random available message
  const randomIndex = Math.floor(Math.random() * availableMessages.length);
  const message = availableMessages[randomIndex];
  
  // Find the actual index in the original array
  const actualIndex = trashTalkMessages.indexOf(message);
  
  // Add to used messages
  usedMessages.push(actualIndex);
  
  // Keep only last MAX_HISTORY messages
  if (usedMessages.length > MAX_HISTORY) {
    usedMessages.shift();
  }
  
  return message;
}

/**
 * Speak a message using TTS (for service workers/background scripts)
 * @param {string} message - The message to speak
 * @param {Object} options - TTS options
 */
export function speak(message, options = {}) {
  const defaults = {
    rate: 1.1,
    pitch: 1.0,
    volume: 0.8
  };

  const ttsOptions = { ...defaults, ...options };

  if (chrome.tts && chrome.tts.speak) {
    chrome.tts.speak(message, {
      rate: ttsOptions.rate,
      pitch: ttsOptions.pitch,
      volume: ttsOptions.volume,
      onEvent: (event) => {
        if (event.type === 'error') {
          console.error('TTS Error:', event);
        }
      }
    });
  } else {
    console.warn('TTS not available');
  }
}

/**
 * Speak a random trash-talk message
 */
export function speakTrashTalk() {
  const message = getRandomTrashTalk();
  speak(message, { rate: 1.2, pitch: 0.9 }); // Slightly faster and lower pitch for emphasis
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech() {
  if (chrome.tts && chrome.tts.stop) {
    chrome.tts.stop();
  }
}

/**
 * Check if TTS is currently speaking
 * @returns {Promise<boolean>}
 */
export function isSpeaking() {
  return new Promise((resolve) => {
    if (chrome.tts && chrome.tts.isSpeaking) {
      chrome.tts.isSpeaking((speaking) => {
        resolve(speaking);
      });
    } else {
      resolve(false);
    }
  });
}
