const purpose = document.getElementById('pur');
const admin_problem = document.getElementById('adp');
const hostel_problem = document.getElementById('hsp');
const academics_problem = document.getElementById('acdp');
const maintain_problem = document.getElementById('mp');

const d = (country, value, state) => {
    const index = country.value;
    const is = index === value;

    console.log(is);
    state.classList[is
        ? "add"
        : "remove"
    ]("display");
};

const c =  ()  =>{
        admin_problem.classList.remove("display");
        admin_problem.value = 'null';
        hostel_problem.classList.remove("display");
        hostel_problem.value = 'null';
        academics_problem.classList.remove("display");
        academics_problem.value = 'null';
        maintain_problem.classList.remove("display");
        maintain_problem.value = 'null';
};

purpose.addEventListener('change', (evt) =>
    c()
);
purpose.addEventListener('change', (evt) =>
    d(purpose, 'ad', admin_problem)
);

purpose.addEventListener('change', (evt) =>
    d(purpose, 'hos', hostel_problem)
);

admin_problem.addEventListener('change', (evt) =>
    d(admin_problem, 'acd', academics_problem)
);

hostel_problem.addEventListener('change', (evt) =>
    d(hostel_problem, 'mai',maintain_problem)
);
