/* The mark revealed by a single stroke travelling along its own spine — the
   artwork is never redrawn, only uncovered. Used as the app's loading state so
   waiting shows the brand rather than a generic spinner. */
import { BRAND } from "../styles/index.js";

/* One continuous gesture, traced from the mark's skeleton: right hook → up
   through the crossing → up the left of the leaf → the top point → back down
   the right → through the crossing again → out to the far-left tail.
   Ribbon half-width peaks at 49.2, so the mask stroke is 100. */
const GESTURE =
  "M770 198C768 200 763 205 759 208C756 211 752 215 749 218C745 221 741 224 738 227C734 230 731 234 727 237C724 240 720 244 717 247C714 251 711 254 707 258C704 262 701 265 698 269C695 273 693 277 690 280C687 284 684 288 681 292C677 295 674 299 671 302C668 306 664 309 661 312C657 315 654 319 650 322C646 324 642 327 638 330C634 332 630 335 625 337C621 339 617 341 612 343C608 344 603 345 599 347C594 348 590 348 585 349C580 349 576 350 571 350C566 350 562 350 557 349C553 349 548 348 543 347C539 346 535 345 530 343C526 341 522 339 518 337C514 335 510 332 506 330C502 328 498 326 494 325C490 323 485 322 481 320C477 319 473 318 468 316C464 315 460 313 456 311C452 309 448 307 444 304C441 301 437 298 434 294C431 291 428 287 425 284C422 280 419 276 416 272C413 268 410 264 407 260C404 256 402 252 399 248C397 244 394 240 392 235C390 231 388 227 386 222C385 218 383 213 382 209C381 204 380 200 379 195C379 190 379 186 379 181C379 176 379 172 379 167C380 162 380 158 381 153C382 148 383 144 384 139C385 134 386 130 387 125C388 121 390 116 392 112C393 108 395 103 398 100C400 96 403 92 406 89C409 86 413 84 417 82C421 80 425 78 430 77C434 75 438 74 443 74C447 73 452 73 456 73C461 73 465 74 469 75C473 77 477 78 481 81C485 83 489 86 492 88C496 91 499 95 502 98C506 101 509 105 512 108C515 112 518 116 521 120C524 124 527 128 529 132C532 136 534 140 536 144C538 149 540 153 541 158C543 162 544 167 545 171C546 176 546 180 547 185C547 190 547 194 547 199C547 204 547 208 546 213C546 218 545 222 544 227C543 231 542 236 540 240C538 245 536 249 534 254C532 258 530 262 527 266C525 271 522 275 520 279C517 283 515 287 512 291C509 295 507 298 504 302C501 305 498 308 494 310C491 312 487 314 483 316C479 318 475 319 471 321C467 322 463 324 459 326C456 328 452 331 449 333C446 336 443 340 439 343C436 346 433 349 429 352C426 356 422 359 418 361C414 364 410 367 406 369C401 371 397 373 393 376C388 378 384 380 379 382C375 384 370 385 366 387C361 389 357 391 352 392C347 394 343 396 338 397C333 399 329 400 324 401C319 403 315 404 310 405C305 406 301 407 296 408C291 409 287 410 282 410C277 411 273 412 268 412C263 413 259 413 254 414C249 414 245 414 240 414C235 414 231 413 226 413C221 412 217 412 212 411C207 411 203 410 198 409C193 409 189 408 184 407C179 406 175 406 170 405C165 404 161 403 156 402C151 401 147 400 142 399C137 398 133 397 128 395C123 394 119 392 114 391C109 390 105 388 100 386C95 385 91 383 86 381C82 379 77 377 73 376C68 374 64 372 59 370C55 368 50 366 46 364C42 361 38 359 33 357C29 355 25 353 21 351C18 349 14 347 10 345C7 343 2 341 0 340";

let uid = 0;

export function RafeeqDraw({ theme = "dark", size = 120, loop = false, className = "" }) {
  /* A unique mask id per instance — two of these on one page would otherwise
     share a mask and only the first would render. */
  const id = `rq-nib-${++uid}`;
  const src = (theme === "light" && BRAND.markLight) || BRAND.mark;

  return (
    <svg className={`rq-draw${loop ? " loop" : ""} ${className}`} viewBox="0 0 776 457"
      style={{ width: size }} xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rafeeq">
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse">
          <path className="rq-draw__nib" d={GESTURE} pathLength="1" fill="none" stroke="#fff"
            strokeWidth="100" strokeLinecap="round" strokeLinejoin="round" />
          {/* the nib covers ~99.5% of the mark; this closes the last slivers */}
          <rect className="rq-draw__flood" x="0" y="0" width="776" height="457" fill="#fff" />
        </mask>
      </defs>
      {src
        ? <image href={src} x="0" y="0" width="776" height="457" mask={`url(#${id})`} />
        : <rect x="0" y="0" width="776" height="457" fill="var(--accent)" mask={`url(#${id})`} />}
    </svg>
  );
}

/* Full-panel loading state: the mark drawing itself, with an optional line. */
export function Loading({ label, theme, size = 108 }) {
  return (
    <div className="rq-loading" role="status" aria-live="polite">
      <RafeeqDraw theme={theme} size={size} loop />
      {label && <p>{label}</p>}
    </div>
  );
}
