po = ["c&b", "cover", "midwicket", "long on", "point", "square leg"];
var v, k, k2, toss, y = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], fw = [0, 0, 0, 0, 0, 0], fh = 0, pt = -1, ct = 0, bt = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], st = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], cw = [0, 0, 0, 0, 0, 0], cm, z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], fs = [0, 0, 0, 0, 0, 0], pd = -1, e = 0, x, g = [0, 0, 0, 0, 0, 0], p = -1, p2, s = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], b = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], f = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], m = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], c = [0, 1], d = [0, 0, 0, 0, 0, 0], r = [0, 0, 0, 0, 0, 0], w = [0, 0, 0, 0, 0, 0], T = 0, T2 = 0, j, i, l = 0, w1 = 0, w2 = 0, B1 = 0, B2 = 0, t;
function rand() {
    return parseInt(Math.random() * 1000000000000000);
}
function team() {
    B1 = B2 = 0;
    this.r = [];
    this.a = [];
    this.st = [];
    this.br = [];
    this.bv = [];
    this.bs = [];
    this.ba = 0;
    this.co = rand() % 11 + 5;
    this.w = 0;
    this.ec = [];
    for (i = 0; i < 6; i++) {
        this.ec[i] = (rand() % 401 + 500) / 100;
        this.bv[i] = rand() % 16 + 15;
        this.bs[i] = rand() % 16 + 15;
        this.r[i] = rand() % 201 + 700;
        B1 += this.r[i] / 11;
        this.a[i] = rand() % 41 + 2 * (5 - i / 2);
        this.st[i] = rand() % 51 + 100;
        this.br[i] = rand() % 201 + 700;
        B2 += this.br[i] / 6;
    }
    for (i = 6; i < 11; i++) {
        this.r[i] = 900 - this.br[i - 6];
        B1 += this.r[i] / 11;
        this.a[i] = rand() % 21 + 2 * (5 - i / 2);
        this.st[i] = rand() % 51 + 100;
    }
    for (i = 0; i < 11; i++) {
        if (i < 6) {
            this.br[i] += this.br[i] / 5 - B2 / 5 + this.co;
        }
        this.r[i] += this.r[i] / 10 - B1 / 10 + this.co;
    }
}
ob = []
ob[0] = new team();
ob[1] = new team();
{
    console.log("\n Team:", "1", "2\n", "Coach:", ob[0].co, ob[1].co);
    console.log("\nBatsmen:   ");
    for (i = 0; i < 6; i++)
        console.log(ob[0].r[i], " ");
    for (i = 0; i < 6; i++)
        console.log(ob[1].r[i], " ");
    console.log("\nAverage:   ");
    for (i = 0; i < 6; i++)
        console.log(ob[0].a[i], "  ");
    console.log("\t\t");
    for (i = 0; i < 6; i++) console.log(ob[1].a[i], " ");
    console.log("\nStrikerate:");
    for (i = 0; i < 6; i++)
        console.log(ob[0].st[i], "  ");
    console.log("\t\t");
    for (i = 0; i < 6; i++)
        console.log(ob[1].st[i], " ");
    console.log("\n\nBowlers:   ");
    for (i = 0; i < 6; i++)
        console.log(ob[0].br[i], " ");
    console.log("\t");
    for (i = 0; i < 6; i++)
        console.log(ob[1].br[i], " ");
    console.log("\nAverage: ");
    for (i = 0; i < 6; i++)
        console.log(ob[0].bv[i], " ");
    console.log("\t");
    for (i = 0; i < 6; i++)
        console.log(ob[1].bv[i], " ");
    console.log("\nStrike Rate: ");
    for (i = 0; i < 6; i++)
        console.log(ob[0].bs[i], " ");
    console.log("\t");
    for (i = 0; i < 6; i++)
        console.log(ob[1].bs[i], " ");
    console.log("\nEconomy: ");
    for (i = 0; i < 6; i++)
        console.log(ob[0].ec[i], " ");
    console.log("\t");
    for (i = 0; i < 6; i++)
        console.log(ob[1].ec[i], " ");
    B1 = B2 = 120;
    T = T2 = 0;
    console.log("\n", "Team ");
    if (rand() % 2) {
        console.log(2);
        toss = 1;
    }
    else {
        console.log(1);
        toss = 0;
    }
    if (rand() % 2)
        console.log(" wins the toss and chooses to bowl first");
    else {
        toss = !toss;
        console.log(" wins the toss and chooses to bat first");
    }
    w1 = w2 = t = p2 = 0;
    for (i = 1; i < 6; i++)
        if (ob[+toss].br[i] > ob[+toss].br[p2])
            p2 = i;
    x = p2;
    console.log("\nBowler ", p2 + 1, " to start proceedings from the pavillion end.....\n\n");
    dot = 0;
    for (i = 0; i < 20 && w1 < 10; ++i) {
        l = cm = 0;
        if (d[x] == 18)
            console.log("So the captain has chosen to bowl Bowler ", x + 1, " out.\n");
        if ((s[c[+t]] >= 44 && s[c[+t]] < 50))
            console.log("Batsman ", c[+t] + 1, " one hit away from a well deserving fifty. Will he make it ?\n\n");
        else if ((s[c[+t]] >= 94 && s[c[+t]] < 100))
            console.log("Batsman ", c[+t] + 1, " knows there is a hundered for the taking if he can knuckle this one down....\n\n");
        for (j = 1; j <= 6; ++j) {
            v = Math.abs(ob[+!toss].r[c[+t]] - ob[+toss].br[x]);
            k2 = (ob[+toss].br[x]) / ((rand() % (ob[+toss].bv[c[+t]] * ob[+toss].br[x] / 750 + 1) + ob[+toss].bv[x] * ob[+toss].br[x] / 1000) * (rand() % (ob[+toss].bs[x] * ob[+toss].br[x] / 750 + 1) + ob[+toss].bs[x] * ob[+toss].br[x] / 1000) * (rand() % (ob[+toss].ec[x] * ob[+toss].br[x] / 750 + 1) + ob[+toss].ec[x] * ob[+toss].br[x] / 1000));
            k = (rand() % (ob[+!toss].a[c[+t]] * ob[+!toss].r[c[+t]] / 1000 + 1) + ob[+!toss].a[c[+t]] * (1000 - ob[+!toss].r[c[+t]]) / 1000) * (rand() % (ob[+!toss].st[c[+t]] * ob[+!toss].r[c[+t]] / 1000 + 1) + ob[+!toss].st[c[+t]] * (1000 - ob[+!toss].r[c[+t]]) / 1000) / ob[+toss].br[x];
            if (!v) v = 1;
            v += 1;
            if (k > k2)
                k += (rand() % v) / 100;
            else
                k -= (rand() % v) / 100;
            ++b[c[+t]];
            ++d[x];
            ++bt[ct];
            if (fh)
                console.log("\nFree Hit: ");
            else
                console.log(i + "." + j, " Bowler ", x + 1, " to Batsman ", c[+t] + 1, ", ");
            if (k <= 0 && !fh) {
                p = c[+t];
                y[c[+t]] = 1;
                console.log("OUT ");
                pd = x;
                ++cw[x];
                pt = ct;
                ++w[x];
                if (k <= 0 && k > -0.5) console.log("(caught)");
                else if (k <= -0.5 && k > -1) console.log("(bowled)");
                else if (k <= -1 && k > -1.5) console.log("(LBW)");
                else if (k <= -1.5 && k > -2) console.log("(stumped)");
                else {
                    v = rand() % 3;
                    if (v) {
                        console.log("  ", v, " run(s), ");
                        st[ct] += v;
                        s[c[+t]] += v;
                        l += v;
                        T += v;

                    }
                    if (rand() % 2)
                        console.log(" Wicket against the run of play ! Absolutely headless running this.");
                    else {
                        console.log(" and he's run his partner out! That was completely uncalled for.");
                        t = !t;
                    }
                    pd = -1;
                    cw[x] = 0;
                    --w[x];
                }
                if (b[c[+t]] == 1) console.log(" first ball ");
                if (!s[c[+t]]) console.log("for a duck !");
                if (w[x] == 5 && !fw[x]) {
                    fw[x] == 1;
                    console.log(", that brings up his five wicket haul, yet another tick in a list of accomplishments.");
                }
                if (s[c[+t]] >= 45 && s[c[+t]] < 50)
                    console.log("\nlooks like there won't be any fifty for Batsman ", c[+t], ", he came so close, and was yet so far.\n");
                else if (s[c[+t]] >= 90 && s[c[+t]] < 100) console.log("\nHe'll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team.\n");
                if (cw[x] == 3) {
                    console.log("\nAnd that is also a hattrick for bowler ", x + 1, "! Fantastic bowling in the time of need.");
                    cw[x] = 0;
                }
                console.log("\nBatsman ", c[+t] + 1);
                if (pd > -1) console.log(", Bowler ", x + 1);
                else console.log(" runout");
                console.log(" ", s[c[+t]], " (", b[c[+t]], " b", " ", f[c[+t]], "X4's ", m[c[+t]], "X6's) SR: ", s[c[+t]] * 100 / b[c[+t]], "\nPartnership: ", st[ct], "(", bt[ct], ")", ", Runrate: ", st[ct] * 6 / bt[ct]);
                ++ct;
                c[+t] = (c[+t] > c[+!t] ? c[+t] : c[+!t]) + 1;
                if (k <= -0 && k >= -0.5 && rand() % 2) {
                    t = !t;
                    console.log("\nThe two batsmen crossed over while the catch was being taken.");
                }
                if (w1++ == 9) {
                    B1 = 6 * i + j;
                    console.log("\nAnd that wraps up the innings.\n");
                    break;
                }
            }
            else {
                v = parseInt(k);
                if (v < 0) v = 0;
                cw[x] = 0;
                if (v > 6) {
                    if (rand() % 2) {
                        console.log(" wide, ");
                        if (rand() % 2) console.log("that is way down the leg side, no mercy for that.");
                        else console.log(" just outside the margin, but the line belongs to the umpire, wide called.");
                    }
                    else {
                        console.log("No ball. An overstep was the last thing the bowling side needed...\n");
                        fh = 1;
                    }
                    --j;
                    ++e;
                    --bt[ct];
                    ++st[ct];
                    --b[c[+t]];
                    --d[x];
                    ++T;
                }
                else {
                    if (fh) fh = 0;
                    switch (v) {
                        case 0:
                            console.log(" no run");
                            ++dot;
                            break;
                        case 5:
                            v -= 1;
                        case 4:
                            console.log("FOUR");
                            ++f[c[+t]];
                            break;
                        case 6:
                            console.log("SIX");
                            ++m[c[+t]];
                            ++cm;
                            break;
                        default:
                            console.log(v, " run(s)");
                            break;
                    }
                    if (v != 6) cm = 0;
                    l += v;
                    s[c[+t]] += v;
                    T += v;
                    st[ct] += v;
                    if (!z[c[+t]] && s[c[+t]] >= 50) {
                        ++z[c[+t]];
                        console.log(" And that brings up his half century - a well timed innings indeed.");
                    }
                    else if (z[c[+t]] == 1 && s[c[+t]] >= 100) {
                        ++z[c[+t]];
                        console.log(" what a wonderful way to bring up his century.");
                    }
                    if (v % 2) t = !t;
                }
            }
        }
        if (cm == 6) console.log("\nSix G.P.L maximums in the previous over ! What an effort by Batsman.", c[+t], ". The crowd is ecstatic, Bowler ", x, " is absolutely flabbergasted.\n");
        r[x] += l;
        t = !t;
        console.log("\nLast over: ");
        if (l)
            console.log(l, " run(s)");
        else {
            if (j == 7) console.log("maiden");
            g[x] += 1;
        }
        console.log("\n Current score: ", T, " / ", w1, "\tRunrate: ", T / (i + 1));
        if (c[+t] < 11) console.log("Batsman: ", c[+t] + 1, " : ", s[c[+t]], " (", b[c[+t]], ") ");
        if (c[+!t] < 11) console.log("Batsman: ", c[+!t] + 1, " : ", s[c[+!t]], " (", b[c[+!t]], ")\nPartnership: ", st[ct], "(", bt[ct], "), runrate: ", st[ct] * 6 / bt[ct]);
        if (p > -1) {
            console.log("\nPrevious Wicket: Batsman ", p + 1, ": ", s[p], "(", b[p], ")");
            if (pd > -1) console.log(", Dismissed by: Bowler ", pd + 1);
            else console.log("(runout)");
            console.log("\nPartnership: ", st[pt], "(", bt[pt], "), runrate: ", st[pt] * 6 / bt[pt]);
        }
        console.log("\nBowler ", x + 1, ": ", d[x] / 6 + "." + d[x] % 6, "-", g[x], "-", w[x], "-", r[x] * 6 / d[x], "\n\n");
        if (d[x] == 24) console.log("And that brings an end to Bowler ", x + 1, "'s spell.\n\n");
        for (j = 0; j < 6; ++j)
            if (d[j] <= 18 && j != p2) {
                v = j;
                break;
            }
        x = v;
        for (j = v + 1; j < 6; ++j)
            if (d[j] <= 18 && ob[+toss].br[j] > ob[+toss].br[x] && j != p2) x = j;
        p2 = x;
    }
    c = [0, 1];
    console.log("\nScorecard:\n\tRuns Balls Strike Rate Fours Sixes \n");
    for (i = 0; i < 11; ++i) {
        if (!b[i]) console.log("\tDNB\n");
        else {
            console.log(s[i], b[i], s[i] * 100 / b[i], f[i], m[i]);
            if (!y[i]) console.log("  (not out)");
        }
        if (i < 10) {
            st[i] = bt[i] = 0;
        }
        b[i] = f[i] = m[i] = y[i] = z[i] = s[i] = b[i] = f[i] = m[i] = 0;
    }
    console.log("Total: ", T, " / ", w1, " (", parseInt(B1 / 6) + "." + B1 % 6, " overs)\tRunrate: ", T * 6 / B1, "\nExtras: ", e, "\n\nBowling Statistics:\n\nBowler Overs Maidens Wickets Runs conceded Economy\n\n");
    for (i = 0; i < 6; i++) {
        console.log(i + 1, parseInt(d[i] / 6) + "." + d[i] % 6, g[i], w[i], r[i], r[i] * 6 / d[i]);
        fw[i] = cw[i] = fs[i] = d[i] = g[i] = r[i] = w[i] = 0;
    }
    console.log("Dot ball percentage: ", dot * 100 / B1, " %");
    e = t = fh = ct = T2 = dot = p2 = 0;
    p = pt = -1;
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    for (i = 1; i < 6; i++)
        if (ob[+!toss].br[i] > ob[+!toss].br[p2])
            p2 = i;
    x = p2;
    console.log("\nBowler ", p2 + 1, " to start proceedings from the pavillion end.....\n\n");
    dot = 0;
    for (i = 0; i < 20 && (w2 < 10 && T <= T); ++i) {
        l = cm = 0;
        if (d[x] == 18)
            console.log("So the captain has chosen to bowl Bowler ", x + 1, " out.\n");
        if ((s[c[+t]] >= 44 && s[c[+t]] < 50))
            console.log("Batsman ", c[+t] + 1, " one hit away from a well deserving fifty. Will he make it ?\n\n");
        else if ((s[c[+t]] >= 94 && s[c[+t]] < 100))
            console.log("Batsman ", c[+t] + 1, " knows there is a hundred for the taking if he can knuckle this one down....\n\n");
        for (j = 1; j <= 6; ++j) {
            v = Math.abs(ob[+toss].r[c[+t]] - ob[+!toss].br[x]);
            k2 = (ob[+!toss].br[x]) / ((rand() % (ob[+!toss].bv[c[+t]] * ob[+!toss].br[x] / 750 + 1) + ob[+!toss].bv[x] * ob[+!toss].br[x] / 1000) * (rand() % (ob[+!toss].bs[x] * ob[+!toss].br[x] / 750 + 1) + ob[+!toss].bs[x] * ob[+!toss].br[x] / 1000) * (rand() % (ob[+!toss].ec[x] * ob[+!toss].br[x] / 750 + 1) + ob[+!toss].ec[x] * ob[+!toss].br[x] / 1000));
            k = (rand() % (ob[+toss].a[c[+t]] * ob[+toss].r[c[+t]] / 1000 + 1) + ob[+toss].a[c[+t]] * (1000 - ob[+toss].r[c[+t]]) / 1000) * (rand() % (ob[+toss].st[c[+t]] * ob[+toss].r[c[+t]] / 1000 + 1) + ob[+toss].st[c[+t]] * (1000 - ob[+toss].r[c[+t]]) / 1000) / ob[+!toss].br[x];
            if (!v) v = 1;
            v += 1;
            if (k > k2)
                k += (rand() % v) / 100;
            else
                k -= (rand() % v) / 100;
            ++b[c[+t]];
            ++d[x];
            ++bt[ct];
            if (fh)
                console.log("\nFree Hit: ");
            else
                console.log(i + "." + j, " Bowler ", x + 1, " to Batsman ", c[+t] + 1, ", ");
            if (k <= 0 && !fh) {
                p = c[+t];
                y[c[+t]] = 1;
                console.log("OUT ");
                pd = x;
                ++cw[x];
                pt = ct;
                ++w[x];
                if (k <= 0 && k > -0.5) console.log("(caught)");
                else if (k <= -0.5 && k > -1) console.log("(bowled)");
                else if (k <= -1 && k > -1.5) console.log("(LBW)");
                else if (k <= -1.5 && k > -2) console.log("(stumped)");
                else {
                    v = rand() % 3;
                    if (v) {
                        console.log("  ", v, " run(s), ");
                        st[ct] += v;
                        s[c[+t]] += v;
                        l += v;
                        T2 += v;
                    }
                    if (rand() % 2)
                        console.log(" Wicket against the run of play ! Absolutely headless running this.");
                    else {
                        console.log(" and he's run his partner out! That was completely uncalled for.");
                        t = !t;
                    }
                    pd = -1;
                    cw[x] = 0;
                    --w[x];
                    if (T2 > T) {
                        console.log("What an emphatic victory ! ");
                        break;
                    }
                    else if (T2 == T) console.log("Scores are level...");
                }
                if (b[c[+t]] == 1) console.log(" first ball ");
                if (!s[c[+t]]) console.log("for a duck !");
                if (w[x] == 5 && !fw[x]) {
                    fw[x] == 1;
                    console.log(", that brings up his five wicket haul, yet another tick in a list of accomplishments.");
                }
                if (s[c[+t]] >= 45 && s[c[+t]] < 50)
                    console.log("\nlooks like there won't be any fifty for Batsman ", c[+t], ", he came so close, and was yet so far.\n");
                else if (s[c[+t]] >= 90 && s[c[+t]] < 100) console.log("\nHe'll be gutted, no doubt. But it was a fantastic innings nevertheless. He has definitely done a job for his team.\n");
                if (cw[x] == 3) {
                    console.log("\nAnd that is also a hattrick for bowler ", x + 1, "! Fantastic bowling in the time of need.");
                    cw[x] = 0;
                }
                console.log("\nBatsman ", c[+t] + 1);
                if (pd > -1) console.log(", Bowler ", x + 1);
                else console.log(" runout");
                console.log(" ", s[c[+t]], " (", b[c[+t]], " b", " ", f[c[+t]], "X4's ", m[c[+t]], "X6's) SR: ", s[c[+t]] * 100 / b[c[+t]], "\nPartnership: ", st[ct], "(", bt[ct], ")", ", Runrate: ", st[ct] * 6 / bt[ct]);
                ++ct;
                c[+t] = (c[+t] > c[+!t] ? c[+t] : c[+!t]) + 1;
                if (k <= -0 && k >= -0.5 && rand() % 2) {
                    t = !t;
                    console.log("\nThe two batsmen crossed over while the catch was being taken.");
                }
                if (w2++ == 9) {
                    B2 = 6 * i + j;
                    console.log("\nAnd that wraps up the innings.\n");
                    break;
                }
            }
            else {
                v = parseInt(k);
                if (v < 0) v = 0;
                cw[x] = 0;
                if (v > 6) {
                    if (rand() % 2) {
                        console.log(" wide, ");
                        if (rand() % 2) console.log("that is way down the leg side, no mercy for that.");
                        else console.log(" just outside the margin, but the line belongs to the umpire, wide called.");
                    }
                    else {
                        console.log("No ball. An overstep was the last thing the bowling side needed...\n");
                        fh = 1;
                    }
                    --j;
                    ++e;
                    --bt[ct];
                    ++st[ct];
                    --b[c[+t]];
                    --d[x];
                    ++T2;
                }
                else {
                    if (fh) fh = 0;
                    switch (v) {
                        case 0:
                            console.log(" no run");
                            ++dot;
                            break;
                        case 5:
                            v -= 1;
                        case 4:
                            console.log("FOUR");
                            ++f[c[+t]];
                            break;
                        case 6:
                            console.log("SIX");
                            ++m[c[+t]];
                            ++cm;
                            break;
                        default:
                            console.log(v, " run(s)");
                            break;
                    }
                    if (v != 6) cm = 0;
                    l += v;
                    s[c[+t]] += v;
                    T2 += v;
                    st[ct] += v;
                    if (T2 == T) console.log("\nScores are level now...\n");
                    else if (T2 > T) {
                        console.log("\nAnd they have done it! What an emphatic victory !\n");
                        B2 = 6 * i + j;
                        break;
                    }
                    if (!z[c[+t]] && s[c[+t]] >= 50) {
                        ++z[c[+t]];
                        console.log(" And that brings up his half century - a well timed innings indeed.");
                    }
                    else if (z[c[+t]] == 1 && s[c[+t]] >= 100) {
                        ++z[c[+t]];
                        console.log(" what a wonderful way to bring up his century.");
                    }
                    if (v % 2) t = !t;
                }
            }
        }
        if (cm == 6) console.log("\nSix G.P.L maximums in the previous over ! What an effort by Batsman.", c[+t], ". The crowd is ecstatic, Bowler ", x, " is absolutely flabbergasted.\n");
        r[x] += l;
        t = !t;
        console.log("\nLast over: ");
        if (l)
            console.log(l, " run(s)");
        else {
            if (j == 7) console.log("maiden");
            g[x] += 1;
        }
        console.log("\n Current score: ", T2, " / ", w2, "\tRunrate: ", T2 / (i + 1));
        if (T2 > T) break;
        console.log(", RRR: ", (T + 1 - T2) / (19 - i), "\n Equation: ", (T + 1 - T2), " runs needed from ", 114 - 6 * i, " balls.\n");
        if (c[+t] < 11) console.log("Batsman: ", c[+t] + 1, " : ", s[c[+t]], " (", b[c[+t]], ") ");
        if (c[+!t] < 11) console.log("Batsman: ", c[+!t] + 1, " : ", s[c[+!t]], " (", b[c[+!t]], ")\nPartnership: ", st[ct], "(", bt[ct], "), runrate: ", st[ct] * 6 / bt[ct]);
        if (p > -1) {
            console.log("\nPrevious Wicket: Batsman ", p + 1, ": ", s[p], "(", b[p], ")");
            if (pd > -1) console.log(", Dismissed by: Bowler ", pd + 1);
            else console.log("(runout)");
            console.log("\nPartnership: ", st[pt], "(", bt[pt], "), runrate: ", st[pt] * 6 / bt[pt]);
        }
        console.log("\nBowler ", x + 1, ": ", parseInt(d[x] / 6) + "." + d[x] % 6, "-", g[x], "-", w[x], "-", r[x] * 6 / d[x], "\n\n");
        if (i < 19 && (T + 1 - T2) / (19 - i) >= 36) console.log("The team might as well hop onto the team bus now....\n");
        if (d[x] == 24) console.log("And that brings an end to Bowler ", x + 1, "'s spell.\n\n");
        for (j = 0; j < 6; ++j)
            if (d[j] <= 18 && j != p2) {
                v = j;
                break;
            }
        x = v;
        for (j = v + 1; j < 6; ++j)
            if (d[j] <= 18 && ob[+!toss].br[j] > ob[+!toss].br[x] && j != p2) x = j;
        p2 = x;
    }
    c = [0, 1];
    console.log("\nScorecard:\n\tRuns Balls Strike Rate Fours Sixes \n");
    for (i = 0; i < 11; ++i) {
        if (!b[i]) console.log("\tDNB\n");
        else {
            console.log(s[i], b[i], s[i] * 100 / b[i], f[i], m[i]);
            if (!y[i]) console.log("  (not out)");
        }
        if (i < 10) {
            st[i] = bt[i] = 0;
        }
        b[i] = f[i] = m[i] = y[i] = z[i] = s[i] = b[i] = f[i] = m[i] = 0;
    }
    console.log("Total: ", T2, " / ", w2, " (", parseInt(B2 / 6) + "." + B2 % 6, " overs)\tRunrate: ", T2 * 6 / B2, "\nExtras: ", e, "\n\nBowling Statistics:\n\nBowler Overs Maidens Wickets Runs conceded Economy\n\n");
    for (i = 0; i < 6; i++) {
        console.log(i + 1, parseInt(d[i] / 6) + "." + d[i] % 6, g[i], w[i], r[i], r[i] * 6 / d[i]);
        fw[i] = cw[i] = fs[i] = d[i] = g[i] = r[i] = w[i] = 0;
    }
    console.log("Dot ball percentage: ", dot * 100 / B2, " %");
    if (!(T - T2))
        if (!(w1 - w2))
            if (!(B1 - B2))
                console.log("TIE !\n");
            else {
                console.log("Team ");
                if (B2 > B1) console.log(+!toss + 1);
                else
                    console.log(+toss + 1);
                console.log(" wins! (higher run rate)\n\n");
            }
        else {
            console.log("Team ");
            if (w1 > w2) console.log(+!toss + 1);
            else console.log(+toss + 1);
            console.log(" wins! (fewer wickets lost)\n\n");
        }
    else {
        console.log("Team ");
        if (T < T2) {
            console.log(+toss + 1, " wins by ", 10 - w2, " wicket(s) !");
        }
        else {
            console.log(+!toss + 1, " wins by ", T - T2, " runs!");
        }
        console.log("\n");
    }
}
