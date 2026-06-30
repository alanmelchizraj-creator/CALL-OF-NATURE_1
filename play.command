#!/bin/bash
cd "$(dirname "$0")"

clear
echo "================================================================="
echo "  🌿 Call of Nature - Instant Chrome Web Game Launcher 🌿"
echo "================================================================="
echo ""
echo "[OK] Launching standalone HTML5 game directly in your browser..."
echo ""
echo "You do NOT need Node.js or internet connection to play this game!"
echo ""

if [ -f "Call_of_Nature_Chrome_Game.html" ]; then
    open "Call_of_Nature_Chrome_Game.html"
    exit 0
fi

if [ -f "Double_Click_To_Play_Offline.html" ]; then
    open "Double_Click_To_Play_Offline.html"
    exit 0
fi

if ! command -v node &> /dev/null
then
    echo "[ERROR] Game file not found and Node.js is not installed."
    echo "Please double-click Call_of_Nature_Chrome_Game.html directly."
    read -r
    exit 1
fi

open http://localhost:3000/
npm run dev

