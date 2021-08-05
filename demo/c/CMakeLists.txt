cmake_minimum_required(VERSION 3.4)
project(picovoice_demo_c)

set(CMAKE_C_STANDARD 99)
set(CMAKE_BUILD_TYPE Release)

set(COMMON_LIBS dl)
set(MIC_LIBS pthread m)

include_directories("${PROJECT_SOURCE_DIR}/../../sdk/c/include")

add_executable(
        picovoice_demo_mic
        picovoice_demo_mic.c)

add_executable(
        picovoice_demo_file
        picovoice_demo_file.c)

if (NOT WIN32)
    target_link_libraries(picovoice_demo_mic ${COMMON_LIBS} ${MIC_LIBS})
    target_link_libraries(picovoice_demo_file ${COMMON_LIBS})
endif()