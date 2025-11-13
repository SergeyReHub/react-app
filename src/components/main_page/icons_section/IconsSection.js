import * as React from 'react';
import { Box, Container, Grid, Typography } from '@mui/material';
import ShieldTwoToneIcon from '@mui/icons-material/ShieldTwoTone';
import AutorenewIcon from '@mui/icons-material/AutorenewTwoTone';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjectsTwoTone';

const SwanIcon = React.forwardRef(({
    sx,
    bodyColor = 'none', // основной цвет тела
    featherColor = 'none', // цвет перьев
    beakColor = 'none', // цвет клюва
    legColor = 'none', // цвет ног
    ...props
}, ref) => (
    <Box
        component="svg"
        ref={ref}
        viewBox="0 0 1024 1024" // Вернул оригинальный viewBox
        sx={{
            // Стили как у Material-UI иконок
            userSelect: 'none',
            width: '1em',
            height: '1em',
            display: 'inline-block',
            flexShrink: 0,
            transition: 'fill 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            fontSize: '1.5rem', // Базовый размер
            ...sx,
        }}
        {...props}
    >
        <g id="SVGRepo_iconCarrier">
            {/* Тело лебедя */}
            <path
                d="M959.7 661.5c0 50.1-17.7 98.2-49.9 136.2-19.9 94.7-103.5 162.8-200.9 162.8H352.2C191.6 960.5 61 829.9 61 669.3c0-47.1 11.5-92.8 32.6-133.6s51.7-76.6 90.2-103.9c3.5-2.4 7.6-3.9 12.2-3.9 11.6 0 21 9.4 21 21 0 55.4 45 100.5 100.4 100.7H670L528.6 408.2c-37.8-37.8-58.6-87.9-58.6-141.3 0-109.7 88.8-199 198.3-199.9 12.5-1.7 86.7-9.8 131 27 1.1 0.9 55.4 51.6 57.1 53.2 19.4 19.4 30.1 45.2 30.1 72.7 0 9.5-1.3 18.8-3.8 27.7l46.2 69.5c14.9 16.7 14.3 42.4-1.7 58.4-8.1 8-18.7 12.5-30.1 12.5-10.6 0-20.5-3.8-28.3-10.8l-82.3-54.7c-27.2 0.7-54.7-9.2-75.5-30l-33.8-33.8c-2.2-2.2-5.1-3.4-8.2-3.4-6 0-10.9 4.4-11.5 10.3-0.1 0.5-0.1 0.9-0.1 1.2 0 4.2 2 7 3.6 8.7l239 239c0.6 0.6 1.2 1.3 1.7 2 37.4 39.3 58 90.6 58 145z"
                fill="none"
                stroke={bodyColor}
                strokeWidth={50}
            />

            {/* Перья */}
            <path
                d="M917.6 661.5c0 41.7-15.3 81.6-43.1 112.5-2.6 2.9-4.4 6.5-5.1 10.3-14.1 77.7-81.6 134-160.6 134H352.2c-137.3 0-249.1-111.7-249.1-249.1 0-68.6 28.4-133.8 77.5-180.5 17 58.4 70.4 101.4 133.8 102.8 0.5 0 1 0.1 1.5 0.1h404.8c5.4 0 10.8-2.1 14.9-6.2 8.2-8.2 8.2-21.5 0-29.8L558.3 378.5c-29.8-29.8-46.2-69.4-46.2-111.6 0-87 70.8-157.8 157.8-157.8 1.1 0 20.5-2.8 41.6-1.6 18.6 1 44.4 5.1 61 19 0.3 0.3 53.2 49.5 54.1 50.5 11.5 11.5 17.8 26.7 17.8 42.9 0 5-0.6 9.8-1.7 14.5l-41.2-41.2c-8.2-8.2-21.5-8.2-29.8 0-8.2 8.2-8.2 21.5 0 29.8l46.7 46.7c-23.6 16.5-56.5 14.2-77.5-6.9L707 229c-10.1-10.1-23.6-15.7-37.9-15.7-27.6 0-50.6 20.7-53.3 48.1-0.2 1.9-0.3 3.7-0.3 5.5 0 19.6 10 32.5 16 38.4l235.3 235.4c0.4 0.5 0.9 1.1 1.4 1.6 31.8 31.8 49.4 74.2 49.4 119.2z"
                fill={featherColor}
                opacity={featherColor === 'transparent' ? 0 : 1} // Добавляем opacity для прозрачности
            />

            {/* Клюв */}
            <path
                d="M894.8 341.9c0.8 1.2 1.7 2.3 2.6 3.2-0.1 0-58.8-38.5-58.8-38.5 6.3-4 12.2-8.6 17.7-14.1 1.1-1.1 2.2-2.3 3.3-3.5l35.2 52.9z"
                fill={beakColor}
            />

            {/* Ноги */}
            <path
                d="M788.9 734.1c11.6 0 21 9.4 21 21 0 69.2-56.3 125.5-125.5 125.5H501.5c-120.9 0-219.2-98.3-219.2-219.2v-10.7c0-11.6 9.4-21 21-21h312c11.6 0 21 9.4 21 21s-9.4 21-21 21H324.7c5.4 92.9 82.6 166.8 176.8 166.8h182.9c46 0 83.4-37.4 83.4-83.4 0-11.6 9.4-21 21.1-21z"
                fill={legColor}
            />
        </g>
    </Box>
));

export default function IconsSection() {
    const [hoveredIcon, setHoveredIcon] = React.useState(null);

    const handleIconHover = (iconName) => {
        setHoveredIcon(iconName);
    };

    const handleIconLeave = () => {
        setHoveredIcon(null);
    };

    const getGradientStyle = () => {
        switch (hoveredIcon) {
            case 'shield':
                return {
                    background: 'linear-gradient(45deg, transparent 0%, rgba(255, 5, 5, 0.2) 40%, transparent 60%)',
                };
            case 'star':
                return {
                    background: 'linear-gradient(to right, transparent 0%, rgba(34, 253, 5, 0.2) 43%, transparent 70%)',
                };
            case 'air':
                return {
                    background: 'linear-gradient(to right, transparent 0%, rgba(240, 248, 0, 0.2) 57%, transparent 80%)',
                };
            case 'swan': // Changed from 'view' to 'swan'
                return {
                    background: 'linear-gradient(to right, transparent 0%, rgba(204, 0, 255, 0.2) 75%, transparent 90%)',
                };
            default:
                return {
                    background: 'linear-gradient(to right, transparent 0%, rgba(100, 100, 100, 0.2) 50%, transparent 100%)',
                };
        }
    };

    return (
        <Container
            component="section"
            aria-label="Icons section"
            sx={{
                backgroundColor: 'black',
                px: 0,
                paddingTop: 2,
                paddingBottom: 6,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 1,
                    pointerEvents: 'none',
                    zIndex: 1,
                    transition: 'background 0.3s ease',
                    ...getGradientStyle(),
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(244, 81, 225, 0.12) 10%, rgba(100, 100, 100, 0.3) 30%, rgba(100, 100, 100, 0.6) 70%, rgba(0, 0, 0, 0.9) 100%)',
                    opacity: 1,
                    pointerEvents: 'none',
                    zIndex: 2,
                }
            }}
            maxWidth={false}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2, position: 'relative', zIndex: 3 }}>
                <Typography variant="h2" color="white" fontWeight="600" textAlign={'center'}>
                    Наши преимущества
                </Typography>
            </Box>

            <Grid container spacing={5} justifyContent="center" sx={{ position: 'relative', zIndex: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{ background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}
                        onMouseEnter={() => handleIconHover('shield')}
                        onMouseLeave={handleIconLeave}
                    >
                        <ShieldTwoToneIcon
                            sx={{
                                fontSize: 90,
                                color: 'rgba(162, 118, 118, 1)',
                                mb: 2,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                            }}
                        />
                        <Typography variant="h5" component="h2" color="white" fontWeight="bold">
                            Прочность
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}
                        onMouseEnter={() => handleIconHover('star')}
                        onMouseLeave={handleIconLeave}
                    >
                        <AutorenewIcon
                            sx={{
                                fontSize: 90,
                                color: 'rgba(142, 184, 144, 1)',
                                mb: 2,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                            }}
                        />
                        <Typography variant="h5" component="h2" color="white" fontWeight="bold">
                            Экологичность
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}
                        onMouseEnter={() => handleIconHover('air')}
                        onMouseLeave={handleIconLeave}
                    >
                        <EmojiObjectsIcon
                            sx={{
                                fontSize: 90,
                                color: 'rgba(189, 194, 147, 1)',
                                mb: 2,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                            }}
                        />
                        <Typography variant="h5" component="h2" color="white" fontWeight="bold">
                            Уникальность
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Box
                        sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}
                        onMouseEnter={() => handleIconHover('swan')} // Changed from 'view' to 'swan'
                        onMouseLeave={handleIconLeave}
                    >
                        <SwanIcon
                            bodyColor="rgba(214, 119, 255, 0.44)" // основной цвет
                            featherColor="transparent" // белые перья
                            beakColor="white" // оранжевый клюв
                            legColor="rgba(214, 119, 255, 0.44)" // темно-коричневые ноги
                            sx={{
                                fontSize: 90,
                                mb: 2,
                                transition: 'transform 0.3s ease',
                                '&:hover': {
                                    transform: 'scale(1.1)',
                                },
                            }}
                        />
                        <Typography variant="h5" component="h2" color="white" fontWeight="bold">
                            Изящество
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
}