/*
    Copyright 2020-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

#ifndef PV_PROFILE_H
#define PV_PROFILE_H

#include "picovoice/pv_picovoice.h"

typedef struct pv_profile pv_profile_t;

pv_status_t pv_profile_init(pv_profile_t **object);
void pv_profile_delete(pv_profile_t *object);
void pv_profile_set_tic(pv_profile_t *object);
void pv_profile_set_toc(pv_profile_t *object);
void pv_profile_reset(pv_profile_t *object);
uint32_t pv_profile_get_elapsed_msec(pv_profile_t *object); // return the elapsed time between last tic and toc
float pv_profile_get_elapsed_percentage(pv_profile_t *object); // return average elapsed time for several ticks in percentage

#endif // PV_PROFILE_H
