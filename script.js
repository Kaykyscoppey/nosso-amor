const SUPABASE_URL = 'https://kjnkvugzyylttdujulrl.supabase.co';

const SUPABASE_KEY = 'sb_publishable_DDF6Sg8OXp2vJNS7ISjaXw_Xz4W9sMr';

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const formulario = document.querySelector('#formMemoria');
const modalMemoria = document.querySelector('#modalMemoria');
const galeria = document.querySelector('#galeria');

formulario.addEventListener('submit', async (event) => {
    event.preventDefault();

    const arquivo = document.querySelector('#campoFoto').files[0];
    const titulo = document.querySelector('#campoTitulo').value;
    const data = document.querySelector('#campoData').value;
    const comentario = document.querySelector('#campoComentario').value;

    if (!arquivo) {
        alert('Escolha uma foto.');
        return;
    }

    const nomeArquivo = `${crypto.randomUUID()}-${arquivo.name}`;

    const { error: erroUpload } = await supabaseClient
        .storage
        .from('memory-photos')
        .upload(nomeArquivo, arquivo);

    if (erroUpload) {
        console.error(erroUpload);
        alert('Erro ao enviar a foto.');
        return;
    }

    const resultadoImagem = supabaseClient
        .storage
        .from('memory-photos')
        .getPublicUrl(nomeArquivo);

    const imagemUrl = resultadoImagem.data.publicUrl;

  const { data: memoriaSalva, error: erroBanco } =
    await supabaseClient
        .from('memories')
        .insert({
            title: titulo,
            memory_date: data,
            comment: comentario,
            image_url: imagemUrl
        })
        .select()
        .single();

    if (erroBanco) {
    console.error(erroBanco);
    alert('Erro ao salvar a memória.');
    return;
}

const novoCartao = criarCartao(memoriaSalva);

galeria.appendChild(novoCartao);

    formulario.reset();
    modalMemoria.classList.remove('modal-aberto');

    alert('Memória salva com sucesso!');



// O fluxo deve ser:

//Salvar foto no Storage
        
//Salvar dados na tabela
        
//Receber memoriaSalva
        
//Criar o article
        
//Adicionar no final da galeria

});


async function carregarMemorias() {
    const { data: memorias, error } =
        await supabaseClient
            .from('memories')
            .select('*')
            .order('created_at', { ascending: true });

    if (error) {
        console.error('Erro ao carregar memórias:', error);
        return;
    }

    memorias.forEach((memoria) => {
        const cartao = criarCartao(memoria);
        galeria.appendChild(cartao);
    });
}

carregarMemorias();

function criarCartao(memoria) {
    const cartao = document.createElement('article');
    cartao.classList.add('memory-card');

    const imagemWrapper = document.createElement('div');
    imagemWrapper.classList.add('image-wrapper');

    const imagem = document.createElement('img');
    imagem.src = memoria.image_url;
    imagem.alt = memoria.title;

    imagemWrapper.appendChild(imagem);

    const conteudo = document.createElement('div');
    conteudo.classList.add('text-content');

    const titulo = document.createElement('h2');
    titulo.textContent = memoria.title;

    const data = document.createElement('span');
    data.classList.add('date');
    data.textContent = memoria.memory_date;

    const comentario = document.createElement('p');
    comentario.textContent = memoria.comment;

    conteudo.append(titulo, data, comentario);
    cartao.append(imagemWrapper, conteudo);

    return cartao;
}