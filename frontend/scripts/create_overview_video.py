from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
MEDIA = ROOT / "frontend" / "public" / "media"
MEDIA.mkdir(parents=True, exist_ok=True)
WIDTH, HEIGHT = 1280, 720
FPS = 24

FONT_REG = Path(r"C:\Windows\Fonts\segoeui.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\segoeuib.ttf")


def font(size: int, bold: bool = False):
    candidate = FONT_BOLD if bold else FONT_REG
    if not candidate.exists():
        candidate = Path(r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf")
    return ImageFont.truetype(str(candidate), size)


def background(accent=(85, 112, 243)):
    image = Image.new("RGB", (WIDTH, HEIGHT))
    pixels = image.load()
    start = (29, 46, 54)
    end = (48, 70, 77)
    for y in range(HEIGHT):
        t = y / (HEIGHT - 1)
        c = tuple(round(start[i] * (1 - t) + end[i] * t) for i in range(3))
        for x in range(WIDTH):
            pixels[x, y] = c
    draw = ImageDraw.Draw(image, "RGBA")
    draw.ellipse((880, -275, 1450, 300), fill=(*accent, 26))
    draw.ellipse((1030, 480, 1405, 855), fill=(158, 195, 139, 19))
    draw.ellipse((-210, 470, 240, 920), fill=(110, 145, 200, 12))
    return image


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def wordmark(draw):
    rounded(draw, (76, 54, 117, 95), 12, (255, 255, 255, 255))
    draw.text((88, 58), "C", font=font(27, True), fill=(77, 104, 225, 255))
    draw.text((130, 59), "career", font=font(22, True), fill=(255, 255, 255, 255))
    draw.text((198, 59), "hub", font=font(22, True), fill=(168, 208, 148, 255))


def label(draw, text, box=(80, 155, 420, 184)):
    rounded(draw, box, 14, (207, 231, 188, 32), outline=(207, 231, 188, 70))
    draw.text((box[0] + 12, box[1] + 6), text.upper(), font=font(11, True), fill=(198, 222, 182, 255))


def small_card(image, box, title, lines, accent=(86, 111, 239), badge=""):
    draw = ImageDraw.Draw(image, "RGBA")
    x1, y1, x2, y2 = box
    rounded(draw, (x1 + 2, y1 + 7, x2 + 2, y2 + 7), 18, (6, 16, 23, 35))
    rounded(draw, box, 18, (255, 255, 255, 255), outline=(229, 234, 233, 255))
    rounded(draw, (x1 + 20, y1 + 20, x1 + 66, y1 + 66), 13, (*accent, 30))
    draw.text((x1 + 29, y1 + 30), "CH", font=font(12, True), fill=(*accent, 255))
    draw.text((x1 + 81, y1 + 22), title, font=font(18, True), fill=(39, 53, 62, 255))
    draw.text((x1 + 81, y1 + 51), lines[0], font=font(12), fill=(116, 130, 137, 255))
    if badge:
        rounded(draw, (x2 - 145, y1 + 22, x2 - 18, y1 + 47), 11, (*accent, 23))
        draw.text((x2 - 132, y1 + 28), badge.upper(), font=font(9, True), fill=(*accent, 255))
    y = y1 + 78
    for item in lines[1:]:
        draw.ellipse((x1 + 22, y + 5, x1 + 29, y + 12), fill=(109, 143, 104, 255))
        draw.text((x1 + 40, y), item, font=font(12), fill=(92, 108, 114, 255))
        y += 27


def scene_cover():
    image = background((88, 110, 244))
    d = ImageDraw.Draw(image, "RGBA")
    wordmark(d)
    label(d, "A thoughtful job discovery preview")
    d.text((80, 226), "Find work that", font=font(57, True), fill=(255, 255, 255, 255))
    d.text((80, 296), "fits your future.", font=font(57, True), fill=(172, 209, 150, 255))
    d.text((84, 394), "A clearer way to explore roles,", font=font(20), fill=(219, 228, 226, 255))
    d.text((84, 426), "save what fits, and choose a next step.", font=font(20), fill=(219, 228, 226, 255))
    rounded(d, (82, 504, 306, 552), 13, (83, 108, 236, 255))
    d.text((104, 518), "CAREERHUB OVERVIEW", font=font(12, True), fill=(255, 255, 255, 255))
    rounded(d, (727, 196, 1169, 530), 23, (255, 255, 255, 255))
    rounded(d, (759, 226, 1135, 280), 12, (247, 248, 246, 255), outline=(231, 234, 230, 255))
    d.text((779, 244), "Search  ·  Role, skill, or company", font=font(15), fill=(137, 148, 151, 255))
    d.text((760, 313), "A GOOD PLACE TO START", font=font(10, True), fill=(115, 127, 134, 255))
    small_card(image, (754, 343, 1140, 446), "Product Designer", ["Numa Studio · Hybrid", "Design systems · Figma"], accent=(104, 86, 198), badge="sample role")
    d = ImageDraw.Draw(image, "RGBA")
    rounded(d, (794, 464, 1104, 498), 10, (236, 240, 255, 255))
    d.text((822, 474), "Search with purpose   ·   Save for later", font=font(11, True), fill=(79, 101, 207, 255))
    return image


def scene_search():
    image = background((87, 112, 239))
    d = ImageDraw.Draw(image, "RGBA")
    wordmark(d)
    label(d, "01  /  Discover with focus")
    d.text((80, 230), "Start with what", font=font(49, True), fill=(255, 255, 255, 255))
    d.text((80, 289), "matters to you.", font=font(49, True), fill=(172, 209, 150, 255))
    d.text((84, 374), "Search by role, skills, location,", font=font(18), fill=(219, 228, 226, 255))
    d.text((84, 403), "or the way you want to work.", font=font(18), fill=(219, 228, 226, 255))
    rounded(d, (722, 195, 1165, 535), 23, (255, 255, 255, 255))
    d.text((756, 224), "Find a role that fits", font=font(19, True), fill=(41, 54, 62, 255))
    rounded(d, (755, 270, 1132, 323), 11, (248, 249, 247, 255), outline=(230, 233, 229, 255))
    d.text((775, 287), "Role  ·  Product designer", font=font(15), fill=(77, 92, 99, 255))
    rounded(d, (755, 337, 1132, 390), 11, (248, 249, 247, 255), outline=(230, 233, 229, 255))
    d.text((775, 354), "Location  ·  Cairo or remote", font=font(15), fill=(77, 92, 99, 255))
    d.text((758, 414), "EXPLORE BY WORK STYLE", font=font(9, True), fill=(133, 145, 148, 255))
    for box, text, color in [((755, 439, 856, 472), "Remote", (83, 108, 236)), ((866, 439, 967, 472), "Hybrid", (85, 139, 100)), ((977, 439, 1098, 472), "On-site", (195, 130, 70))]:
        rounded(d, box, 10, (*color, 23))
        d.text((box[0] + 16, box[1] + 10), text, font=font(11, True), fill=(*color, 255))
    d.text((757, 497), "Relevant sample roles appear in one place.", font=font(11), fill=(123, 136, 141, 255))
    return image


def scene_shortlist():
    image = background((91, 154, 102))
    d = ImageDraw.Draw(image, "RGBA")
    wordmark(d)
    label(d, "02  /  Keep a useful shortlist")
    d.text((80, 230), "Keep good options", font=font(46, True), fill=(255, 255, 255, 255))
    d.text((80, 289), "close at hand.", font=font(46, True), fill=(172, 209, 150, 255))
    d.text((84, 374), "Save interesting roles and", font=font(18), fill=(219, 228, 226, 255))
    d.text((84, 403), "return when you are ready.", font=font(18), fill=(219, 228, 226, 255))
    rounded(d, (718, 185, 1168, 542), 23, (255, 255, 255, 255))
    d.text((752, 215), "Your saved roles", font=font(20, True), fill=(41, 54, 62, 255))
    d.text((752, 247), "A shortlist that stays in this browser", font=font(11), fill=(127, 139, 142, 255))
    small_card(image, (746, 281, 1140, 388), "Frontend Engineer", ["Orbit Health · Remote", "React · TypeScript"], accent=(77, 141, 97), badge="saved")
    small_card(image, (746, 407, 1140, 514), "Product Designer", ["Numa Studio · Hybrid", "Figma · Design systems"], accent=(105, 89, 199), badge="saved")
    d = ImageDraw.Draw(image, "RGBA")
    rounded(d, (1056, 208, 1139, 235), 12, (236, 240, 255, 255))
    d.text((1070, 216), "2 saved", font=font(9, True), fill=(81, 102, 204, 255))
    return image


def scene_details():
    image = background((202, 135, 74))
    d = ImageDraw.Draw(image, "RGBA")
    wordmark(d)
    label(d, "03  /  Understand the opportunity")
    d.text((80, 230), "Know what a role", font=font(46, True), fill=(255, 255, 255, 255))
    d.text((80, 289), "is really about.", font=font(46, True), fill=(172, 209, 150, 255))
    d.text((84, 374), "Review location, skills, and", font=font(18), fill=(219, 228, 226, 255))
    d.text((84, 403), "responsibilities before applying.", font=font(18), fill=(219, 228, 226, 255))
    rounded(d, (724, 184, 1168, 544), 23, (255, 255, 255, 255))
    rounded(d, (755, 215, 800, 260), 12, (231, 239, 255, 255))
    d.text((771, 226), "O", font=font(20, True), fill=(78, 106, 210, 255))
    d.text((817, 218), "Frontend Engineer", font=font(19, True), fill=(42, 54, 62, 255))
    d.text((817, 246), "Orbit Health  ·  Remote", font=font(11), fill=(124, 137, 140, 255))
    rounded(d, (755, 276, 911, 304), 10, (241, 244, 255, 255))
    d.text((769, 285), "ILLUSTRATIVE ROLE", font=font(9, True), fill=(83, 105, 206, 255))
    d.text((755, 329), "WHAT YOU WILL DO", font=font(10, True), fill=(123, 136, 140, 255))
    points = ["Build responsive product experiences.", "Partner with design and engineering.", "Improve accessibility and quality."]
    for i, item in enumerate(points):
        y = 358 + i * 35
        rounded(d, (756, y, 776, y + 20), 7, (230, 244, 226, 255))
        d.text((762, y + 3), "✓", font=font(11, True), fill=(86, 140, 90, 255))
        d.text((790, y + 4), item, font=font(11), fill=(83, 98, 103, 255))
    d.text((756, 484), "Preview listings are fictional samples.", font=font(10), fill=(153, 139, 122, 255))
    return image


def scene_creator():
    image = background((85, 147, 98))
    d = ImageDraw.Draw(image, "RGBA")
    wordmark(d)
    label(d, "A project by Kareem Mohamed Bakr")
    d.text((80, 238), "Thoughtful work", font=font(50, True), fill=(255, 255, 255, 255))
    d.text((80, 300), "starts with a", font=font(50, True), fill=(255, 255, 255, 255))
    d.text((80, 362), "thoughtful search.", font=font(50, True), fill=(172, 209, 150, 255))
    d.text((85, 460), "Explore. Save. Move forward with clarity.", font=font(18), fill=(219, 228, 226, 255))
    rounded(d, (744, 224, 1157, 492), 25, (255, 255, 255, 255))
    rounded(d, (782, 263, 835, 316), 15, (233, 240, 255, 255))
    d.text((797, 276), "C", font=font(26, True), fill=(79, 105, 218, 255))
    d.text((855, 267), "CareerHub", font=font(29, True), fill=(38, 52, 60, 255))
    d.text((784, 344), "A job discovery experience designed", font=font(16), fill=(103, 119, 124, 255))
    d.text((784, 373), "to make the next move feel clearer.", font=font(16), fill=(103, 119, 124, 255))
    rounded(d, (784, 421, 1114, 461), 12, (238, 242, 255, 255))
    d.text((811, 433), "Created by Kareem Mohamed Bakr", font=font(12, True), fill=(78, 99, 200, 255))
    return image


def scene_search_guide(step, accent, title_lines, subtitle_lines, panel_title, rows):
    image = background(accent)
    d = ImageDraw.Draw(image, "RGBA")
    wordmark(d)
    label(d, step)
    y = 230
    for line in title_lines:
        d.text((80, y), line, font=font(46, True), fill=(172, 209, 150, 255) if y > 285 else (255, 255, 255, 255))
        y += 58
    y += 26
    for line in subtitle_lines:
        d.text((84, y), line, font=font(17), fill=(219, 228, 226, 255))
        y += 28
    rounded(d, (720, 188, 1167, 540), 23, (255, 255, 255, 255))
    d.text((754, 218), panel_title, font=font(19, True), fill=(41, 54, 62, 255))
    for index, row in enumerate(rows):
        row_y = 265 + index * 66
        rounded(d, (754, row_y, 1132, row_y + 53), 10, (247, 248, 246, 255), outline=(232, 235, 230, 255))
        rounded(d, (766, row_y + 10, 798, row_y + 42), 9, (*accent, 28))
        d.text((777, row_y + 18), f"{index + 1:02d}", font=font(8, True), fill=(*accent, 255))
        d.text((812, row_y + 10), row[0], font=font(12, True), fill=(53, 66, 73, 255))
        d.text((812, row_y + 29), row[1], font=font(10), fill=(123, 136, 140, 255))
    d.text((755, 491), "Small, consistent steps are easier to sustain.", font=font(10), fill=(133, 144, 145, 255))
    return image


def encode_video(story_slides, video_name, poster_name, end_hold_seconds):
    story_slides[0].save(MEDIA / poster_name, quality=90, optimize=True)
    hold_frames = 4 * FPS
    transition_frames = int(0.4 * FPS)
    ending_frames = round(end_hold_seconds * FPS)
    destination = MEDIA / video_name
    process = subprocess.Popen(
        [
            "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-vcodec", "rawvideo",
            "-pix_fmt", "rgb24", "-s", f"{WIDTH}x{HEIGHT}", "-framerate", str(FPS), "-i", "-",
            "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", str(destination),
        ],
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    assert process.stdin is not None
    try:
        for index, slide in enumerate(story_slides):
            final_slide = index == len(story_slides) - 1
            count = hold_frames + (ending_frames if final_slide else 0)
            for _ in range(count):
                process.stdin.write(slide.tobytes())
            if not final_slide:
                next_slide = story_slides[index + 1]
                for transition in range(transition_frames):
                    process.stdin.write(Image.blend(slide, next_slide, (transition + 1) / transition_frames).tobytes())
    finally:
        process.stdin.close()
    error = process.stderr.read().decode("utf-8", errors="replace") if process.stderr else ""
    code = process.wait()
    if code:
        raise RuntimeError(f"FFmpeg could not create {video_name}: {error}")
    count = len(story_slides) * hold_frames + ending_frames + (len(story_slides) - 1) * transition_frames
    print(f"Created {destination} ({count / FPS:.1f}s)")


slides = [scene_cover(), scene_search(), scene_shortlist(), scene_details(), scene_creator()]
slides[0].save(MEDIA / "careerhub-overview-poster.jpg", quality=90, optimize=True)

fps = FPS
hold_frames = 4 * fps
transition_frames = int(0.4 * fps)
ending_hold_frames = int(0.5 * fps)
output = MEDIA / "careerhub-overview.mp4"
process = subprocess.Popen(
    [
        "ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-vcodec", "rawvideo",
        "-pix_fmt", "rgb24", "-s", f"{WIDTH}x{HEIGHT}", "-framerate", str(fps), "-i", "-",
        "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "22", "-pix_fmt", "yuv420p",
        "-movflags", "+faststart", str(output),
    ],
    stdin=subprocess.PIPE,
    stdout=subprocess.DEVNULL,
    stderr=subprocess.PIPE,
)
assert process.stdin is not None
try:
    for index, slide in enumerate(slides):
        final_slide = index == len(slides) - 1
        scene_frames = hold_frames + (ending_hold_frames if final_slide else 0)
        for _ in range(scene_frames):
            process.stdin.write(slide.tobytes())
        if index < len(slides) - 1:
            next_slide = slides[index + 1]
            for step in range(transition_frames):
                alpha = (step + 1) / transition_frames
                process.stdin.write(Image.blend(slide, next_slide, alpha).tobytes())
finally:
    process.stdin.close()
error = process.stderr.read().decode("utf-8", errors="replace") if process.stderr else ""
status = process.wait()
if status:
    raise RuntimeError(f"FFmpeg could not create the overview video: {error}")
frame_count = len(slides) * hold_frames + ending_hold_frames + (len(slides) - 1) * transition_frames
print(f"Created {output} ({frame_count / fps:.1f}s)")

search_guide = [
    scene_search_guide(
        "01  /  Set a direction", (86, 111, 239),
        ["Choose a", "direction."], ["Start with a target role,", "then decide location and work style."],
        "Your search starts here",
        [("Target role", "One role and two alternatives"), ("Location", "City, region, or remote"), ("Work style", "Remote, hybrid, or on-site")],
    ),
    scene_search_guide(
        "02  /  Search with focus", (89, 145, 100),
        ["Search with", "focus."], ["Use roles and skills to", "move past unrelated results."],
        "Make the search specific",
        [("Role", "A title that matches your direction"), ("Skills", "Strengths you want to use"), ("Location", "A place or work style that fits")],
    ),
    scene_search_guide(
        "03  /  Keep a shortlist", (131, 103, 194),
        ["Keep a clear", "shortlist."], ["Save a few good options,", "then compare the work itself."],
        "Compare what matters",
        [("Responsibilities", "What the day-to-day work includes"), ("Requirements", "Skills the team is looking for"), ("Work style", "Where and how the role happens")],
    ),
    scene_search_guide(
        "04  /  Prepare one next step", (197, 133, 76),
        ["Prepare one", "next step."], ["Focus your CV and notes", "on one promising opportunity."],
        "Before you reach out",
        [("Choose an example", "A result that fits the role"), ("Tailor your introduction", "Make the relevant experience clear"), ("Track your next action", "A note for the next conversation")],
    ),
]
encode_video(search_guide, "career-search-guide.mp4", "career-search-guide-poster.jpg", 0.875)

def creator_profile_scene():
    image = background((142, 111, 255))
    d = ImageDraw.Draw(image, "RGBA")
    wordmark(d)
    label(d, "Kareem Mohamed Bakr · About me", (80, 155, 430, 184))
    d.text((80, 238), "Kareem", font=font(59, True), fill=(255, 255, 255, 255))
    d.text((80, 309), "Mohamed Bakr", font=font(43, True), fill=(195, 181, 255, 255))
    d.text((84, 405), "Computer Science & IT student", font=font(19), fill=(219, 228, 226, 255))
    d.text((84, 440), "Cybersecurity foundations", font=font(18), fill=(219, 228, 226, 255))
    rounded(d, (82, 518, 427, 562), 14, (217, 255, 121, 255))
    d.text((103, 531), "LEARN  ·  BUILD  ·  SHARE", font=font(12, True), fill=(27, 36, 34, 255))

    portrait_path = ROOT / "frontend" / "public" / "images" / "kareem-mohammed.png"
    portrait = Image.open(portrait_path).convert("RGB").resize((394, 394), Image.Resampling.LANCZOS)
    mask = Image.new("L", (394, 394), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, 393, 393), radius=40, fill=255)
    image.paste(portrait, (805, 166), mask)
    d = ImageDraw.Draw(image, "RGBA")
    rounded(d, (805, 166, 1199, 560), 40, (255, 255, 255, 0), outline=(255, 255, 255, 104), width=2)
    rounded(d, (864, 526, 1137, 580), 15, (13, 17, 26, 239), outline=(255, 255, 255, 42))
    d.text((883, 544), "CREATOR OF CAREERHUB", font=font(11, True), fill=(217, 255, 121, 255))
    return image


creator_intro = [
    creator_profile_scene(),
    scene_search_guide(
        "01  /  CYBERSECURITY & NETWORKS", (88, 119, 255),
        ["Understand the", "system. Protect it."],
        ["Learning Linux, networking, and", "responsible security testing."],
        "A growing foundation",
        [("Systems", "Linux and system security"), ("Networks", "TCP/IP and traffic analysis"), ("Practice", "Wireshark and Nmap")],
    ),
    scene_search_guide(
        "02  /  SOFTWARE, AI & MEDIA", (167, 119, 255),
        ["Make ideas", "useful and clear."],
        ["Building web systems and AI-assisted", "content workflows."],
        "Create with intention",
        [("Build", "Java, JavaScript, and Python"), ("Automate", "Prompts and connected tools"), ("Tell stories", "Short-form digital media")],
    ),
    scene_search_guide(
        "CURRENT PROJECT  /  CAREERHUB", (89, 145, 100),
        ["Create room", "for what’s next."],
        ["CareerHub brings focused search, role", "details, and a useful career toolkit."],
        "A clearer career search",
        [("Discover", "Find relevant sample roles"), ("Track", "Keep a clear next step"), ("Prepare", "Use tools for your search")],
    ),
]
encode_video(creator_intro, "kareem-careerhub-intro.mp4", "kareem-careerhub-intro-poster.jpg", 0.5)

tracker_guide = [
    scene_search_guide(
        "01  /  SAVE THE OPPORTUNITY", (86, 111, 239),
        ["Keep the details", "close at hand."],
        ["Add a role, company, and the date", "so nothing important gets lost."],
        "Your application starts here",
        [("Role", "The title you are exploring"), ("Company", "Where the opportunity is"), ("Date", "When you added it")],
    ),
    scene_search_guide(
        "02  /  UPDATE YOUR STAGE", (89, 145, 100),
        ["See your progress", "at a glance."],
        ["Move from interested to applied,", "interview, or offer."],
        "One clear pipeline",
        [("Interested", "A role worth considering"), ("Applied", "Your application is in"), ("Interview", "A conversation is underway")],
    ),
    scene_search_guide(
        "03  /  CHOOSE A NEXT STEP", (131, 103, 194),
        ["Every follow-up", "has a home."],
        ["Keep notes, prepare for a call,", "and export your list any time."],
        "Make the next move visible",
        [("Add a note", "Remember what matters"), ("Plan a follow-up", "Write down your next action"), ("Export", "Keep your own copy")],
    ),
]
encode_video(tracker_guide, "application-tracker-guide.mp4", "application-tracker-guide-poster.jpg", 1.5)
