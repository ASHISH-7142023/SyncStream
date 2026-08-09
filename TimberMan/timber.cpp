#include <SFML/Graphics.hpp>
#include <iostream>
#include <cmath>
#include<sstream>
#include <SFML/Audio.hpp>
using namespace sf;
void cloudUpdate(Sprite &spriteCloud, Time &dt, float &cloudPixelPerSecond)
{
    float x = spriteCloud.getPosition().x;
    float y = spriteCloud.getPosition().y;
    if (x > 1980)
    {
        spriteCloud.setPosition(-200, y); // reset cloud to left
    }
    else
    {
        spriteCloud.setPosition(x + (dt.asSeconds() *cloudPixelPerSecond),y); // move right
    }
}

void beeUpdate(Sprite &spriteBee, Time &dt, float &beeSpeed)
{
    static float timex = 0;
    static float y_dir = 820;
    timex += dt.asSeconds();
    float x = spriteBee.getPosition().x;
    float y = spriteBee.getPosition().y;
    if (x < 0)
    {
        y_dir = 820 + rand() % 200 - 100; // randomize vertical position
        spriteBee.setPosition(2000, y);   // reset to right
    }
    else
    {
        y = y_dir + 50 * sin(timex); // vertical sine motion
        spriteBee.setPosition(x - (dt.asSeconds() * beeSpeed),y); // move left
    }
}

void branchUpdate(int &numBranches, Sprite *spriteBranch, float &chopHeight)
{
    for (int i = numBranches - 1; i > 0; i--)
    {
        float x = spriteBranch[i - 1].getPosition().x;
        float y = spriteBranch[i - 1].getPosition().y;
        if (y > 900)
            y = -200;
        else
            y += chopHeight;
        spriteBranch[i].setPosition(x, y);
        spriteBranch[i].setRotation(spriteBranch[i - 1].getRotation());
    } // Randomly place a new branch or leave empty
    int r = rand() % 3;
    float x, rotate = 0;
    if (r == 0)
    {
        x = 590;
        rotate = 180;
    } // Left
    else if (r == 1)
    {
        x = 1330;
        rotate = 0;
    } // Right
    else
    {
        x = 3000;
    } // No branch
    spriteBranch[0].setPosition(x, -200);
    spriteBranch[0].setRotation(rotate);
}

// Updates the on-screen score text
void scoreUpdate(Text &scoreText, int &score_val)
{
    std::stringstream ss;
    ss << "Score = " << score_val;
    scoreText.setString(ss.str());
} 
// Updates the time bar; handles time-out scenario
void timebarUpdate(RectangleShape &timebar, float &timeRemaining, bool &pause, bool &timeOut, Text &messageText, float &timebarHeight, float &timebarWidthPerSecond, Time &dt, bool logActive)
{
    if (!logActive)
    {
        timeRemaining -= dt.asSeconds();
        if (timeRemaining < 0)
        {
            pause = true;
            timeOut = true;
            messageText.setString("TimeOut!!!");
            timebar.setSize(Vector2f(0, timebarHeight)); // hide time bar
        }
        else
        {
            if (timeRemaining > 6.0f)
            timeRemaining = 6.0f;
            float newBarWidth = timeRemaining * timebarWidthPerSecond;
            timebar.setSize(Vector2f(newBarWidth, timebarHeight));
        }
    }
}

int main()
{
    VideoMode vm(1920, 1080);
    RenderWindow window(vm, "Timber!!!");

    View view(FloatRect(0, 0, 1920, 1080));
    window.setView(view);

    Texture textureBackground;
    textureBackground.loadFromFile("graphics/background.png");
    Sprite spriteBackground;
    spriteBackground.setTexture(textureBackground);
    spriteBackground.setPosition(0, 0);

    Texture textureTree;
    textureTree.loadFromFile("graphics/tree.png");
    Sprite spriteTree;
    spriteTree.setTexture(textureTree);
    spriteTree.setPosition(810, 0);

    Texture textureBee;
    textureBee.loadFromFile("graphics/bee.png");
    Sprite spriteBee;
    spriteBee.setTexture(textureBee);
    spriteBee.setPosition(2000, 800);
    float beeSpeed = 1920 / 15.0f;

    Texture texturePlayer;
    texturePlayer.loadFromFile("graphics/player.png");
    Sprite spritePlayer;
    spritePlayer.setTexture(texturePlayer);
    spritePlayer.setOrigin(75, 96);
    spritePlayer.setPosition(610, 804);
    spritePlayer.setScale(-1, 1);

    Texture textureAxe;
    textureAxe.loadFromFile("graphics/axe.png");
    Sprite spriteAxe;
    spriteAxe.setTexture(textureAxe);
    spriteAxe.setPosition(740, 825);
    spriteAxe.setOrigin(76, 14);
    Texture textureRip;
    textureRip.loadFromFile("graphics/rip.png");
    Sprite spriteRip;
    spriteRip.setTexture(textureRip);

    Font font;
    font.loadFromFile("font/KOMIKAP_.ttf");
    int score_val = 0;
    sf::Text scoreText;
    scoreText.setFont(font);
    scoreText.setCharacterSize(30);
    scoreText.setFillColor(sf::Color::White);
    scoreText.setPosition(50, 50);
    scoreText.setString("Score: 0");
    // float totalTime = 10.0f;
    // float elapsedTime = 0.0f;

    Text messageText;
    messageText.setFont(font);
    messageText.setCharacterSize(80);
    messageText.setFillColor(Color::White);
    messageText.setString("Press Enter to start the game !!!!");
    messageText.setPosition(1980 / 2.0, 1020 / 2.0f);
    FloatRect details = messageText.getLocalBounds();
    messageText.setOrigin(details.left + details.width / 2.0f, details.top + details.height / 2.0f);

    // Time bar setup RectangleShape timebar;
    RectangleShape timeBar;
    float timebarHeight = 80;
    float tiembarWidth = 400;
    timeBar.setSize(Vector2f(tiembarWidth, timebarHeight));
    timeBar.setFillColor(Color::Red);
    timeBar.setPosition((1920 / 2.0f) - 200, 1020 - 140);
    float timeRemaining = 6.0f;
    float timebarWidthPerSecond = tiembarWidth / timeRemaining;

    Texture textureCloud;
    textureCloud.loadFromFile("graphics/cloud.png");
    Sprite spriteCloud, spriteCloud2, spriteCloud3;
    spriteCloud.setTexture(textureCloud);
    spriteCloud2.setTexture(textureCloud);
    spriteCloud3.setTexture(textureCloud);
    spriteCloud2.setPosition(0, 50);
    spriteCloud3.setPosition(0, 100);
    spriteCloud.setPosition(0, 200);
    spriteCloud.setScale(0.3, 0.3);
    spriteCloud2.setScale(0.6, 0.6);

    float cloudPixelPerSecond = 1920 / 20.0f;
    float cloud2PixelPerSecond = 1920 / 30.0f;
    float cloud3PixelPerSecond = 1920 / 10.0f;

    int numBranches = 6;
    Sprite spriteBranch[numBranches];
    Texture textureBranch;
    textureBranch.loadFromFile("graphics/branch.png");
    for (int i = 0; i < numBranches; i++)
    {
        spriteBranch[i].setTexture(textureBranch);
        spriteBranch[i].setPosition(590, -200);
        spriteBranch[i].setOrigin(220, 40);
        spriteBranch[i].setRotation(180);
    }
    float chopHeight = 200;
// Sound effect
    Sound chop;
    SoundBuffer chopSound;
    chopSound.loadFromFile("sound/chop.wav");
    chop.setBuffer(chopSound);

    // Log setup
    Sprite spriteLog;
    Texture textureLog;
    textureLog.loadFromFile("graphics/log.png");
    spriteLog.setTexture(textureLog);
    spriteLog.setPosition(810, 780);
    float speedLog = 0.3;
    float logPixelPerSecX = 990 / speedLog;
    float logPixelPerSecY = 200 / speedLog;
    int logDir = 0;

    // Game state flags
    bool logActive = false, pause = true, timeOut = false;
    bool acceptInput = true, gamestart = false, gameOver = false;
    Clock clock;
    Time dt;
    while (window.isOpen())
    {
        dt = clock.restart();
        Event event;
        while (window.pollEvent(event))
        {
            if (event.type == Event::Closed)
                window.close();

            if (event.type == Event::KeyReleased && !acceptInput)
            {
                spriteAxe.setPosition(2300, 800);
                acceptInput = true;
            }
        }
        // Input checks and gameplay logic
        if (acceptInput)
        {
            // Start or restart the game
            if (Keyboard::isKeyPressed(Keyboard::Enter))
            {
                if (timeOut || gameOver)
                {
                    pause = false;
                    timeRemaining = 6.0f;
                    score_val = 0;
                    messageText.setString("");
                    timeOut = false;
                    gameOver = false;
                    for (int i = 0; i < numBranches; i++)
                        spriteBranch[i].setPosition(3000, -200);
                    spritePlayer.setPosition(1130, 708);
                    spriteRip.setPosition(2300, 750);
                    spriteLog.setPosition(810, 780);
                    logActive = false;
                    spritePlayer.setScale(1, 1);
                }
                else
                {
                    gamestart = true;
                    pause = false;
                    messageText.setString("");
                }
                acceptInput = false;
            }
            // Pause the game
            if (Keyboard::isKeyPressed(Keyboard::Space) && gamestart)
            {
                pause = !pause;
                messageText.setString(pause ? "Game is Paused !!!" : "");
                acceptInput = false;
            }
            // Chop left
            if (Keyboard::isKeyPressed(Keyboard::Left) && !pause)
            {
                score_val++;
                timeRemaining += (2.0f / score_val) + 0.2f;
                branchUpdate(numBranches, spriteBranch, chopHeight);
                spritePlayer.setPosition(790, 708);
                spriteAxe.setPosition(740, 800);
                spritePlayer.setScale(-1, 1);
                logActive = true;
                logDir = 1;
                chop.play();
                acceptInput = false;
            }
            // Chop right
            if (Keyboard::isKeyPressed(Keyboard::Right) && !pause)
            {
                score_val++;
                timeRemaining += (2.0f / score_val) + 0.2f;
                branchUpdate(numBranches, spriteBranch, chopHeight);
                spritePlayer.setPosition(1130, 708);
                spritePlayer.setScale(1, 1);
                spriteAxe.setPosition(1040, 800);
                logActive = true;
                logDir = -1;
                chop.play();
                acceptInput = false;
            }
        }
        // Move the log if it's active
        if (logActive && !pause)
        {
            acceptInput = false;
            float x = spriteLog.getPosition().x;
            float y = spriteLog.getPosition().y;
            if (x < -100 || x > 2000)
            {
                // Log goes off screen — reset
                x = 810;
                y = 780;
                logActive = false;
                acceptInput = true;
            }
            else
            {
                // Move the log diagonally
                y -= logPixelPerSecY * dt.asSeconds();
                x += logDir * logPixelPerSecX * dt.asSeconds();
            }
            spriteLog.setPosition(x, y);
        }
        // Update game objects if not paused
        if (!pause)
        {
            cloudUpdate(spriteCloud, dt, cloudPixelPerSecond);
            cloudUpdate(spriteCloud2, dt, cloud2PixelPerSecond);
            cloudUpdate(spriteCloud3, dt, cloud3PixelPerSecond);
            beeUpdate(spriteBee, dt, beeSpeed);
            scoreUpdate(scoreText, score_val);
            timebarUpdate(timeBar, timeRemaining, pause, timeOut, messageText, timebarHeight, timebarWidthPerSecond, dt,logActive);
        }

            // Game over condition (player hit by branch)
            if(spritePlayer.getGlobalBounds().intersects(spriteBranch[numBranches -1].getGlobalBounds())) {
                gameOver = true;
                pause = true;
                score_val = 0;
                messageText.setString("GAME OVER !!!!!");
                timeRemaining = 0;
                timeBar.setSize(Vector2f(0, timebarHeight));
                float x = spritePlayer.getPosition().x;
                spriteRip.setPosition(x, 750);
                spritePlayer.setPosition(2300, 708); // hide player
            }
            // Update message text centering
            FloatRect details = messageText.getLocalBounds();
            float originX = details.left + (details.width / 2.0f);
            float originY = details.top + (details.height / 2.0f);
            messageText.setOrigin(originX, originY);

    window.clear();
    window.draw(spriteBackground);
    window.draw(spriteCloud);
    window.draw(spriteCloud2);
    window.draw(spriteCloud3);
    window.draw(spriteTree);
    for (int i = 0; i < numBranches; i++)
        window.draw(spriteBranch[i]);
    window.draw(spritePlayer);
    window.draw(spriteLog);
    window.draw(spriteAxe);
    window.draw(spriteRip);
    window.draw(spriteBee);
    window.draw(scoreText);
    window.draw(messageText);
    window.draw(timeBar);
    window.display();
}

return 0;
}